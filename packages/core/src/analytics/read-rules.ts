/**
 * US-028 (#28): "article opened" and "article read" rules (FR-22).
 */
import type { ArticleStatus } from '../types';

/** Reader must stay open this long for the article to count as opened. */
export const OPENED_MIN_MS = 5_000;
/** Minimum max-scroll depth (%) for an article to count as read. */
export const READ_MIN_SCROLL_PCT = 80;
/** Minimum share of the estimated reading time actually spent reading. */
export const READ_MIN_ACTIVE_SHARE = 0.3;

/** Opened = reader open ≥ 5 seconds. */
export function isOpened(openDurationMs: number): boolean {
  return openDurationMs >= OPENED_MIN_MS;
}

/** % read = max scroll depth of the article body, clamped to 0–100. */
export function percentRead(maxScrollPct: number): number {
  if (!Number.isFinite(maxScrollPct)) return 0;
  return Math.min(100, Math.max(0, maxScrollPct));
}

export interface ReadEvidence {
  maxScrollPct: number;
  /** Total active reading seconds on this article, across all sessions and devices. */
  activeSeconds: number;
  estimatedMinutes: number;
}

/** Read = max scroll ≥ 80% AND active time ≥ 30% of the estimated time. */
export function isRead({ maxScrollPct, activeSeconds, estimatedMinutes }: ReadEvidence): boolean {
  const requiredSeconds = Math.max(1, estimatedMinutes) * 60 * READ_MIN_ACTIVE_SHARE;
  return percentRead(maxScrollPct) >= READ_MIN_SCROLL_PCT && activeSeconds >= requiredSeconds;
}

export interface StatusUpdate {
  status: ArticleStatus;
  read_at?: string;
}

/**
 * Status change implied by reading activity, or null when nothing changes.
 * - unread + opened → in_progress
 * - unread / in_progress + read rule met → read (read_at set)
 * Archived and already-read articles are never changed automatically.
 */
export function statusAfterReading(
  current: ArticleStatus,
  evidence: ReadEvidence & { openDurationMs: number },
  now: Date,
): StatusUpdate | null {
  if (current === 'read' || current === 'archived') return null;
  if (isRead(evidence)) return { status: 'read', read_at: now.toISOString() };
  if (current === 'unread' && isOpened(evidence.openDurationMs)) return { status: 'in_progress' };
  return null;
}
