// US-002 (#2): RLS checked end to end with two real accounts through the public API.
// Needs the local stack (`npm run db:start`). Run: `npm run db:test:auth`.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { before, describe, it } from 'node:test';

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
// Default: the public demo anon key every local Supabase stack uses.
const anonKey =
  process.env.SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function newAccount(name) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const email = `${name}-${randomUUID()}@example.com`;
  const { data, error } = await client.auth.signUp({ email, password: 'correct-horse-battery' });
  assert.ifError(error);
  assert.ok(data.session, 'local stack signs users in right away (no email confirmation)');
  return { client, userId: data.user.id };
}

describe('RLS with two accounts', () => {
  let a;
  let b;
  let articleA;

  before(async () => {
    a = await newAccount('a');
    b = await newAccount('b');
    const { data, error } = await a.client
      .from('articles')
      .insert({ user_id: a.userId, url: 'https://example.com/a', canonical_url: 'https://example.com/a' })
      .select('id')
      .single();
    assert.ifError(error);
    articleA = data.id;
  });

  it('A reads their own article', async () => {
    const { data, error } = await a.client.from('articles').select('id');
    assert.ifError(error);
    assert.deepEqual(data.map((r) => r.id), [articleA]);
  });

  it("B can't read A's articles, profile or goal", async () => {
    for (const table of ['articles', 'profiles', 'goals']) {
      const { data, error } = await b.client.from(table).select('user_id').eq('user_id', a.userId);
      assert.ifError(error);
      assert.equal(data.length, 0, `${table} leaks A's rows to B`);
    }
  });

  it("B can't update or delete A's article", async () => {
    const upd = await b.client.from('articles').update({ title: 'pwned' }).eq('id', articleA).select();
    assert.equal(upd.data?.length ?? 0, 0);
    const del = await b.client.from('articles').delete().eq('id', articleA).select();
    assert.equal(del.data?.length ?? 0, 0);
    const { data } = await a.client.from('articles').select('title').eq('id', articleA).single();
    assert.equal(data.title, null, "A's article is untouched");
  });

  it("B can't insert rows owned by A", async () => {
    const { error } = await b.client
      .from('articles')
      .insert({ user_id: a.userId, url: 'https://example.com/x', canonical_url: 'https://example.com/x' });
    assert.equal(error?.code, '42501');
  });

  it("B can't attach a highlight to A's article", async () => {
    const { error } = await b.client
      .from('highlights')
      .insert({ user_id: b.userId, article_id: articleA, text: 'x', start_offset: 0, end_offset: 1 });
    assert.ok(error, 'insert must fail');
  });

  it('signed-out clients see nothing', async () => {
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data } = await anon.from('articles').select('id');
    assert.equal(data?.length ?? 0, 0);
  });
});
