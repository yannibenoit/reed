import { describe, expect, it } from 'vitest';
import { isOpened, isRead, percentRead, statusAfterReading } from './read-rules';

const now = new Date('2026-11-26T10:00:00Z');

describe('isOpened', () => {
  it('requires ≥ 5 seconds', () => {
    expect(isOpened(4_999)).toBe(false);
    expect(isOpened(5_000)).toBe(true);
  });
});

describe('percentRead', () => {
  it('clamps to 0–100', () => {
    expect(percentRead(-3)).toBe(0);
    expect(percentRead(42.5)).toBe(42.5);
    expect(percentRead(130)).toBe(100);
    expect(percentRead(Number.NaN)).toBe(0);
  });
});

describe('isRead', () => {
  // 10 min article → needs 180 s active
  it('needs both scroll ≥ 80% and active ≥ 30% of estimate', () => {
    expect(isRead({ maxScrollPct: 80, activeSeconds: 180, estimatedMinutes: 10 })).toBe(true);
    expect(isRead({ maxScrollPct: 79.9, activeSeconds: 600, estimatedMinutes: 10 })).toBe(false);
    expect(isRead({ maxScrollPct: 100, activeSeconds: 179, estimatedMinutes: 10 })).toBe(false);
  });

  it('skimming to the bottom does not count as read', () => {
    expect(isRead({ maxScrollPct: 100, activeSeconds: 20, estimatedMinutes: 10 })).toBe(false);
  });
});

describe('statusAfterReading', () => {
  const evidence = { maxScrollPct: 10, activeSeconds: 10, estimatedMinutes: 10, openDurationMs: 6_000 };

  it('unread + opened → in_progress', () => {
    expect(statusAfterReading('unread', evidence, now)).toEqual({ status: 'in_progress' });
  });

  it('unread opened < 5s → no change', () => {
    expect(statusAfterReading('unread', { ...evidence, openDurationMs: 3_000 }, now)).toBeNull();
  });

  it('in_progress + rule met → read with read_at', () => {
    const read = { ...evidence, maxScrollPct: 95, activeSeconds: 240 };
    expect(statusAfterReading('in_progress', read, now)).toEqual({ status: 'read', read_at: now.toISOString() });
  });

  it('never changes archived or read articles', () => {
    const read = { ...evidence, maxScrollPct: 95, activeSeconds: 240 };
    expect(statusAfterReading('archived', read, now)).toBeNull();
    expect(statusAfterReading('read', read, now)).toBeNull();
  });
});
