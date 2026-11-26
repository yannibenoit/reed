import { describe, expect, it } from 'vitest';
import { localDate } from './local-date';
import { buildTodayQueue, rankCandidates, removeFromToday, type TodayCandidate } from './today-queue';

const now = new Date('2026-11-26T08:00:00Z');
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

function art(id: string, over: Partial<TodayCandidate> = {}): TodayCandidate {
  return {
    id,
    status: 'unread',
    contentState: 'ready',
    savedAt: daysAgo(1),
    remainingMinutes: 6,
    tagIds: [],
    ...over,
  };
}

describe('buildTodayQueue', () => {
  it('empty backlog → empty queue', () => {
    expect(buildTodayQueue({ candidates: [], goalMinutes: 15, now })).toEqual([]);
  });

  it('only long articles → one article covers the goal', () => {
    const candidates = [art('a', { remainingMinutes: 25 }), art('b', { remainingMinutes: 40, savedAt: daysAgo(2) })];
    expect(buildTodayQueue({ candidates, goalMinutes: 15, now })).toEqual(['a']);
  });

  it('adds articles until remaining minutes ≥ goal', () => {
    const candidates = [
      art('a', { remainingMinutes: 4, savedAt: daysAgo(1) }),
      art('b', { remainingMinutes: 8, savedAt: daysAgo(2) }),
      art('c', { remainingMinutes: 8, savedAt: daysAgo(3) }),
      art('d', { remainingMinutes: 8, savedAt: daysAgo(4) }),
    ];
    expect(buildTodayQueue({ candidates, goalMinutes: 15, now })).toEqual(['a', 'b', 'c']);
  });

  it('orders in-progress, then saved 7–28 days ago, then other unread newest first', () => {
    const candidates = [
      art('new', { savedAt: daysAgo(1) }),
      art('old', { savedAt: daysAgo(60) }),
      art('sweet', { savedAt: daysAgo(10) }),
      art('started', { status: 'in_progress', savedAt: daysAgo(90) }),
    ];
    expect(rankCandidates(candidates, now).map((c) => c.id)).toEqual(['started', 'sweet', 'new', 'old']);
  });

  it('only picks ready unread/in-progress articles', () => {
    const candidates = [
      art('pending', { contentState: 'pending' }),
      art('gone', { contentState: 'unavailable' }),
      art('done', { status: 'read' }),
      art('archived', { status: 'archived' }),
      art('ok'),
    ];
    expect(buildTodayQueue({ candidates, goalMinutes: 30, now })).toEqual(['ok']);
  });

  it('max 2 articles per tag', () => {
    const candidates = [
      art('a', { tagIds: ['ai'], savedAt: daysAgo(1) }),
      art('b', { tagIds: ['ai'], savedAt: daysAgo(2) }),
      art('c', { tagIds: ['ai', 'design'], savedAt: daysAgo(3) }),
      art('d', { tagIds: ['design'], savedAt: daysAgo(4) }),
    ];
    expect(buildTodayQueue({ candidates, goalMinutes: 30, now })).toEqual(['a', 'b', 'd']);
  });

  it('prefers a mix with one short article (swaps when the goal is still met)', () => {
    const candidates = [
      art('long1', { remainingMinutes: 12, savedAt: daysAgo(1) }),
      art('long2', { remainingMinutes: 12, savedAt: daysAgo(2) }),
      art('short', { remainingMinutes: 4, savedAt: daysAgo(3) }),
    ];
    // greedy picks long1+long2 (24 ≥ 15); long1+short = 16 still meets the goal
    expect(buildTodayQueue({ candidates, goalMinutes: 15, now })).toEqual(['long1', 'short']);
  });

  it('appends the short article when swapping would miss the goal', () => {
    const candidates = [
      art('long1', { remainingMinutes: 8, savedAt: daysAgo(1) }),
      art('long2', { remainingMinutes: 8, savedAt: daysAgo(2) }),
      art('short', { remainingMinutes: 3, savedAt: daysAgo(3) }),
    ];
    expect(buildTodayQueue({ candidates, goalMinutes: 15, now })).toEqual(['long1', 'long2', 'short']);
  });

  it('"Not today" replaces the removed article and keeps the others in place', () => {
    const candidates = [
      art('a', { remainingMinutes: 8, savedAt: daysAgo(1) }),
      art('b', { remainingMinutes: 8, savedAt: daysAgo(2) }),
      art('c', { remainingMinutes: 8, savedAt: daysAgo(3) }),
    ];
    const queue = buildTodayQueue({ candidates, goalMinutes: 15, now });
    expect(queue).toEqual(['a', 'b']);
    expect(removeFromToday(queue, 'a', { candidates, goalMinutes: 15, now })).toEqual(['b', 'c']);
  });

  it('articles read today stay in the queue (✓ in place) when pinned', () => {
    const candidates = [art('a', { status: 'read', remainingMinutes: 8 }), art('b', { savedAt: daysAgo(2) })];
    expect(buildTodayQueue({ candidates, goalMinutes: 15, now, pinnedIds: ['a', 'b'] })).toEqual(['a', 'b']);
  });
});

describe('localDate', () => {
  it('uses the user time zone', () => {
    const at = new Date('2026-11-26T23:30:00Z');
    expect(localDate(at, 'UTC')).toBe('2026-11-26');
    expect(localDate(at, 'Europe/Paris')).toBe('2026-11-27');
    expect(localDate(at, 'America/New_York')).toBe('2026-11-26');
  });
});
