/**
 * US-027 (#27): active reading time.
 *
 * Time counts as active only while the reader is in the foreground and the user
 * interacted (scroll/tap) recently. Rule: the gap between two consecutive marks
 * (session start, return to foreground, interaction, end) counts in full when it is
 * ≤ 60 s, and not at all when it is longer — a gap > 60 s is idle time.
 *
 * Pure state machine: pass timestamps in ms; the reader feeds it events.
 */
import type { ReadingMode } from '../types';

export const IDLE_THRESHOLD_MS = 60_000;

export interface ActiveTimeState {
  readonly startedAt: number;
  readonly foreground: boolean;
  /** Last start/foreground/interaction time, while in the foreground. */
  readonly lastMarkAt: number;
  readonly activeMs: number;
}

export interface CompletedSession {
  startedAt: number;
  endedAt: number;
  activeSeconds: number;
  mode: ReadingMode;
}

function credit(state: ActiveTimeState, at: number): number {
  if (!state.foreground) return state.activeMs;
  const gap = at - state.lastMarkAt;
  return gap > 0 && gap <= IDLE_THRESHOLD_MS ? state.activeMs + gap : state.activeMs;
}

/** The reader opened in the foreground. */
export function startSession(at: number): ActiveTimeState {
  return { startedAt: at, foreground: true, lastMarkAt: at, activeMs: 0 };
}

/** Scroll, tap or key press in the reader. Ignored while in the background. */
export function recordInteraction(state: ActiveTimeState, at: number): ActiveTimeState {
  if (!state.foreground || at < state.lastMarkAt) return state;
  return { ...state, activeMs: credit(state, at), lastMarkAt: at };
}

/** App/tab went to the background (or the reader lost visibility). */
export function enterBackground(state: ActiveTimeState, at: number): ActiveTimeState {
  if (!state.foreground) return state;
  return { ...state, activeMs: credit(state, at), foreground: false, lastMarkAt: at };
}

/** Reader is visible again: counts as a fresh mark. */
export function enterForeground(state: ActiveTimeState, at: number): ActiveTimeState {
  if (state.foreground) return state;
  return { ...state, foreground: true, lastMarkAt: at };
}

/** Active ms so far, as if the session ended at `at` (for live display). */
export function activeMsAt(state: ActiveTimeState, at: number): number {
  return credit(state, at);
}

/** Close the session and produce the row to store in `reading_sessions`. */
export function endSession(state: ActiveTimeState, at: number, mode: ReadingMode = 'read'): CompletedSession {
  const endedAt = Math.max(at, state.startedAt);
  return {
    startedAt: state.startedAt,
    endedAt,
    activeSeconds: Math.round(credit(state, endedAt) / 1000),
    mode,
  };
}
