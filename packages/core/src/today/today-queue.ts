/**
 * US-017 (#17): the daily "Today" queue (FR-13).
 *
 * Built once per local day and kept stable. Articles are added until their total
 * remaining minutes reach the goal, in this order:
 *   1. in-progress articles (most recently read first)
 *   2. unread articles saved 7–28 days ago (newest first)
 *   3. other unread articles (newest first)
 * Constraints: only `content_state = ready`; at most 2 articles per tag; prefer
 * including one short (≤ 5 min) article alongside longer ones when possible.
 */
import type { ArticleStatus, ContentState } from '../types';

export const MAX_PER_TAG = 2;
export const SHORT_MAX_MINUTES = 5;
const DAY_MS = 86_400_000;

export interface TodayCandidate {
  id: string;
  status: ArticleStatus;
  contentState: ContentState;
  savedAt: string;
  /** Last time the user read it (for ordering in-progress articles). */
  lastReadAt?: string | null;
  /** Minutes left to read (estimated × (1 − progress)), at least 1. */
  remainingMinutes: number;
  tagIds: readonly string[];
}

export interface TodayQueueInput {
  candidates: readonly TodayCandidate[];
  goalMinutes: number;
  now: Date;
  /** Articles the user removed today ("Not today"). */
  excludedIds?: readonly string[];
  /** Articles already in today's queue that must stay (used when replacing one). */
  pinnedIds?: readonly string[];
}

const isShort = (c: TodayCandidate) => c.remainingMinutes <= SHORT_MAX_MINUTES;
const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) : 0);

function tier(c: TodayCandidate, now: Date): 1 | 2 | 3 {
  if (c.status === 'in_progress') return 1;
  const ageDays = (now.getTime() - time(c.savedAt)) / DAY_MS;
  return ageDays >= 7 && ageDays <= 28 ? 2 : 3;
}

/** Eligible candidates in priority order. */
export function rankCandidates(candidates: readonly TodayCandidate[], now: Date): TodayCandidate[] {
  return candidates
    .filter((c) => c.contentState === 'ready' && (c.status === 'unread' || c.status === 'in_progress'))
    .map((c) => ({ c, t: tier(c, now) }))
    .sort((a, b) => {
      if (a.t !== b.t) return a.t - b.t;
      if (a.t === 1) return time(b.c.lastReadAt ?? b.c.savedAt) - time(a.c.lastReadAt ?? a.c.savedAt);
      return time(b.c.savedAt) - time(a.c.savedAt);
    })
    .map(({ c }) => c);
}

class TagBudget {
  private counts = new Map<string, number>();
  fits(c: TodayCandidate) {
    return c.tagIds.every((t) => (this.counts.get(t) ?? 0) < MAX_PER_TAG);
  }
  add(c: TodayCandidate) {
    for (const t of c.tagIds) this.counts.set(t, (this.counts.get(t) ?? 0) + 1);
  }
  remove(c: TodayCandidate) {
    for (const t of c.tagIds) this.counts.set(t, (this.counts.get(t) ?? 1) - 1);
  }
}

const total = (q: readonly TodayCandidate[]) => q.reduce((s, c) => s + c.remainingMinutes, 0);

/** Returns the ordered list of article ids for today. */
export function buildTodayQueue(input: TodayQueueInput): string[] {
  const { goalMinutes, now } = input;
  const excluded = new Set(input.excludedIds ?? []);
  const pinnedIds = new Set(input.pinnedIds ?? []);
  const ranked = rankCandidates(input.candidates, now).filter((c) => !excluded.has(c.id));

  const budget = new TagBudget();
  const queue: TodayCandidate[] = [];
  // Pinned articles keep their place even if they would break the tag limit.
  for (const id of input.pinnedIds ?? []) {
    const c = input.candidates.find((x) => x.id === id);
    if (c && !excluded.has(id)) {
      queue.push(c);
      budget.add(c);
    }
  }

  const rest = ranked.filter((c) => !pinnedIds.has(c.id));
  for (const c of rest) {
    if (total(queue) >= goalMinutes) break;
    if (!budget.fits(c)) continue;
    queue.push(c);
    budget.add(c);
  }

  // Mix: if nothing short made it in, bring in the best short candidate —
  // swapping out the last added unpinned, non-in-progress article when the
  // goal is still met without it, otherwise appending.
  if (queue.length > 0 && !queue.some(isShort)) {
    const short = rest.find((c) => isShort(c) && !queue.includes(c) && budget.fits(c));
    if (short) {
      let swapIndex = -1;
      for (let i = queue.length - 1; i >= 0; i--) {
        const c = queue[i]!;
        if (!pinnedIds.has(c.id) && c.status !== 'in_progress') {
          swapIndex = i;
          break;
        }
      }
      const swapped = queue[swapIndex];
      if (swapped && total(queue) - swapped.remainingMinutes + short.remainingMinutes >= goalMinutes) {
        queue.splice(swapIndex, 1);
        budget.remove(swapped);
      }
      // Removing an article only frees tag slots, so `short` still fits.
      queue.push(short);
      budget.add(short);
    }
  }

  return queue.map((c) => c.id);
}

/**
 * "Not today": drop one article and refill from the next candidates while the
 * rest of the queue stays as it is.
 */
export function removeFromToday(
  queueIds: readonly string[],
  removedId: string,
  input: Omit<TodayQueueInput, 'pinnedIds'>,
): string[] {
  const excludedIds = [...(input.excludedIds ?? []), removedId];
  return buildTodayQueue({ ...input, excludedIds, pinnedIds: queueIds.filter((id) => id !== removedId) });
}
