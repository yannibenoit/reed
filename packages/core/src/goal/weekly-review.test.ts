import { describe, expect, it } from 'vitest';
import { hitsNeededToIncrease, reviewGoal, reviewPeriod, roundUpToStep, type ReviewDay } from './weekly-review';

function week(minutes: number[], restDays: number[] = []): ReviewDay[] {
  return minutes.map((m, i) => ({ date: `2026-11-${String(16 + i).padStart(2, '0')}`, minutes: m, isRestDay: restDays.includes(i) }));
}

describe('reviewGoal', () => {
  it('skips when the goal is locked', () => {
    expect(reviewGoal({ currentMinutes: 10, locked: true, days: week([30, 30, 30, 30, 30, 30, 30]) })).toEqual({
      kind: 'skipped',
      reason: 'locked',
    });
  });

  it('increase: ≥ 5 of 7 days hit → max(goal + 5, avg rounded up to 5)', () => {
    // avg 12 → round up 15; goal + 5 = 15
    const r = reviewGoal({ currentMinutes: 10, locked: false, days: week([12, 12, 12, 12, 12, 12, 12]) });
    expect(r).toMatchObject({ kind: 'increase', proposedMinutes: 15, daysHit: 7 });
  });

  it('increase uses the average when it is well above goal + 5', () => {
    // avg = 23 → 25
    const r = reviewGoal({ currentMinutes: 10, locked: false, days: week([23, 23, 23, 23, 23, 23, 23]) });
    expect(r).toMatchObject({ kind: 'increase', proposedMinutes: 25 });
  });

  it('4 of 7 days hit is not enough to increase', () => {
    const r = reviewGoal({ currentMinutes: 10, locked: false, days: week([10, 10, 10, 10, 6, 6, 6]) });
    expect(r).toMatchObject({ kind: 'stay', proposedMinutes: null, daysHit: 4 });
  });

  it('decrease: average < 50% of goal → goal − 5', () => {
    const r = reviewGoal({ currentMinutes: 20, locked: false, days: week([5, 5, 5, 5, 5, 5, 5]) });
    expect(r).toMatchObject({ kind: 'decrease', proposedMinutes: 15 });
  });

  it('otherwise the goal stays', () => {
    const r = reviewGoal({ currentMinutes: 20, locked: false, days: week([15, 15, 15, 15, 15, 15, 15]) });
    expect(r).toMatchObject({ kind: 'stay', proposedMinutes: null, averageMinutes: 15 });
  });

  it('upper bound: never proposes above 60', () => {
    const r = reviewGoal({ currentMinutes: 55, locked: false, days: week([90, 90, 90, 90, 90, 90, 90]) });
    expect(r).toMatchObject({ kind: 'increase', proposedMinutes: 60 });
    const atMax = reviewGoal({ currentMinutes: 60, locked: false, days: week([90, 90, 90, 90, 90, 90, 90]) });
    expect(atMax).toMatchObject({ kind: 'stay', proposedMinutes: null });
  });

  it('lower bound: never proposes below 5', () => {
    const atMin = reviewGoal({ currentMinutes: 5, locked: false, days: week([0, 0, 0, 0, 0, 0, 0]) });
    expect(atMin).toMatchObject({ kind: 'stay', proposedMinutes: null });
  });

  it('rest days are excluded from the average and the hit count', () => {
    // Sat/Sun rest with 0 min; 5 weekdays at 12 → avg 12, 5/5 hits
    const r = reviewGoal({ currentMinutes: 10, locked: false, days: week([12, 12, 12, 12, 12, 0, 0], [5, 6]) });
    expect(r).toMatchObject({ kind: 'increase', proposedMinutes: 15, daysCounted: 5, averageMinutes: 12 });
  });

  it('all rest days → no proposal', () => {
    const r = reviewGoal({ currentMinutes: 10, locked: false, days: week([0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 3, 4, 5, 6]) });
    expect(r).toMatchObject({ kind: 'stay', daysCounted: 0 });
  });
});

describe('helpers', () => {
  it('roundUpToStep', () => {
    expect(roundUpToStep(15)).toBe(15);
    expect(roundUpToStep(15.1)).toBe(20);
    expect(roundUpToStep(0)).toBe(0);
  });

  it('hitsNeededToIncrease scales "5 of 7" with rest days', () => {
    expect(hitsNeededToIncrease(7)).toBe(5);
    expect(hitsNeededToIncrease(5)).toBe(4);
  });

  it('reviewPeriod returns the previous 7 days, across month boundaries', () => {
    expect(reviewPeriod('2026-12-01')).toEqual([
      '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-30',
    ]);
  });
});
