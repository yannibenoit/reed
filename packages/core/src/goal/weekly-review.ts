/**
 * US-032 (#32): weekly goal review (FR-26).
 *
 * Runs on the previous 7 local days. Rest days (US-034) are excluded from the
 * average and from the hit count. The result is only a *proposal*: the user must
 * accept it (US-033, D4).
 */

export const GOAL_MIN = 5;
export const GOAL_MAX = 60;
export const GOAL_STEP = 5;
/** Days hit (out of 7 counted days) needed to propose an increase. */
export const INCREASE_HITS_OF_7 = 5;
/** Proposal to decrease when the average is below this share of the goal. */
export const DECREASE_BELOW_SHARE = 0.5;

export interface ReviewDay {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** Read + listened minutes that day (D1, Q-NS-2). */
  minutes: number;
  isRestDay: boolean;
}

export type GoalReviewResult =
  | { kind: 'skipped'; reason: 'locked' }
  | {
      kind: 'increase' | 'decrease' | 'stay';
      currentMinutes: number;
      /** Null when the goal stays. */
      proposedMinutes: number | null;
      averageMinutes: number;
      daysHit: number;
      daysCounted: number;
    };

export function clampGoal(minutes: number): number {
  return Math.min(GOAL_MAX, Math.max(GOAL_MIN, minutes));
}

/** Round up to the next multiple of 5 (15 → 15, 15.1 → 20). */
export function roundUpToStep(minutes: number): number {
  return Math.ceil(minutes / GOAL_STEP) * GOAL_STEP;
}

/**
 * Hits needed to increase. "5 of 7" scales with rest days removed
 * (e.g. 2 rest days → 5 counted days → 4 hits needed).
 */
export function hitsNeededToIncrease(daysCounted: number): number {
  return Math.ceil((daysCounted * INCREASE_HITS_OF_7) / 7);
}

export function reviewGoal(input: {
  currentMinutes: number;
  locked: boolean;
  days: readonly ReviewDay[];
}): GoalReviewResult {
  const { currentMinutes, locked, days } = input;
  if (locked) return { kind: 'skipped', reason: 'locked' };

  const counted = days.filter((d) => !d.isRestDay);
  const daysCounted = counted.length;
  const total = counted.reduce((sum, d) => sum + Math.max(0, d.minutes), 0);
  const averageMinutes = daysCounted === 0 ? 0 : total / daysCounted;
  const daysHit = counted.filter((d) => d.minutes >= currentMinutes).length;
  const base = { currentMinutes, averageMinutes, daysHit, daysCounted };

  if (daysCounted === 0) return { kind: 'stay', proposedMinutes: null, ...base };

  if (daysHit >= hitsNeededToIncrease(daysCounted)) {
    const proposed = clampGoal(Math.max(currentMinutes + GOAL_STEP, roundUpToStep(averageMinutes)));
    if (proposed > currentMinutes) return { kind: 'increase', proposedMinutes: proposed, ...base };
  } else if (averageMinutes < currentMinutes * DECREASE_BELOW_SHARE) {
    const proposed = clampGoal(currentMinutes - GOAL_STEP);
    if (proposed < currentMinutes) return { kind: 'decrease', proposedMinutes: proposed, ...base };
  }

  return { kind: 'stay', proposedMinutes: null, ...base };
}

/**
 * Local dates (YYYY-MM-DD) of the 7 days reviewed on `reviewDate`:
 * the 7 days before it, oldest first.
 */
export function reviewPeriod(reviewDate: string): string[] {
  const [y, m, d] = reviewDate.split('-').map(Number) as [number, number, number];
  const dates: string[] = [];
  for (let back = 7; back >= 1; back--) {
    dates.push(new Date(Date.UTC(y, m - 1, d - back)).toISOString().slice(0, 10));
  }
  return dates;
}
