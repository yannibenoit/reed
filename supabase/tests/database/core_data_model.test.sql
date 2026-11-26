-- US-003 (#3): schema + RLS checks. Run with `npm run db:test`.
begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- Tables exist
select has_table('public', t, t || ' exists')
from unnest(array[
  'articles', 'tags', 'article_tags', 'reading_sessions', 'reading_progress',
  'highlights', 'goals', 'goal_reviews', 'daily_stats'
]) as t;

-- Two users; the bootstrap trigger creates profile + 10 min goal
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.dev'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.dev');

select is(
  (select minutes from public.goals where user_id = '00000000-0000-0000-0000-00000000000a'),
  10, 'new users start with a 10 min goal'
);

-- Unique (user_id, canonical_url)
insert into public.articles (id, user_id, url, canonical_url) values
  ('10000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'https://x.dev/a?utm=1', 'https://x.dev/a');

select throws_ok(
  $$insert into public.articles (user_id, url, canonical_url)
    values ('00000000-0000-0000-0000-00000000000a', 'https://x.dev/a', 'https://x.dev/a')$$,
  '23505', null, 'same canonical_url twice for one user is rejected'
);

select lives_ok(
  $$insert into public.articles (user_id, url, canonical_url)
    values ('00000000-0000-0000-0000-00000000000b', 'https://x.dev/a', 'https://x.dev/a')$$,
  'another user can save the same canonical_url'
);

-- Tag names are case-insensitive unique per user
insert into public.tags (user_id, name) values ('00000000-0000-0000-0000-00000000000a', 'Design');
select throws_ok(
  $$insert into public.tags (user_id, name) values ('00000000-0000-0000-0000-00000000000a', 'design')$$,
  '23505', null, 'tag names are case-insensitive unique'
);

-- RLS: act as user B
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);

select is((select count(*)::int from public.articles), 1, 'user B only sees their own articles');

select throws_ok(
  $$insert into public.articles (user_id, url, canonical_url)
    values ('00000000-0000-0000-0000-00000000000a', 'https://evil.dev', 'https://evil.dev')$$,
  '42501', null, 'user B cannot insert rows for user A'
);

select throws_ok(
  $$insert into public.highlights (user_id, article_id, text, start_offset, end_offset)
    values ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000a', 'x', 0, 1)$$,
  '23503', null, 'user B cannot attach a highlight to user A''s article'
);

select * from finish();
rollback;
