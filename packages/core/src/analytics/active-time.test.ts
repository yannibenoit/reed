import { describe, expect, it } from 'vitest';
import {
  endSession,
  enterBackground,
  enterForeground,
  recordInteraction,
  startSession,
  type ActiveTimeState,
} from './active-time';

const s = (n: number) => n * 1000;
const MIN = 60_000;

function scrollEvery(state: ActiveTimeState, everyMs: number, fromMs: number, toMs: number) {
  let st = state;
  for (let t = fromMs + everyMs; t <= toMs; t += everyMs) st = recordInteraction(st, t);
  return st;
}

describe('active reading time', () => {
  it('5 min with scrolling every 20s → ~5 min', () => {
    const st = scrollEvery(startSession(0), s(20), 0, 5 * MIN);
    expect(endSession(st, 5 * MIN).activeSeconds).toBe(300);
  });

  it('5 min with no interaction after 1 min → 1 min', () => {
    const st = scrollEvery(startSession(0), s(20), 0, 1 * MIN);
    expect(endSession(st, 5 * MIN).activeSeconds).toBe(60);
  });

  it('counts the tail after the last interaction when it is short', () => {
    const st = recordInteraction(startSession(0), s(30));
    expect(endSession(st, s(50)).activeSeconds).toBe(50);
  });

  it('excludes background time', () => {
    let st = recordInteraction(startSession(0), s(30));
    st = enterBackground(st, s(40));
    st = recordInteraction(st, s(100)); // ignored: not visible
    st = enterForeground(st, s(200));
    st = recordInteraction(st, s(220));
    expect(endSession(st, s(230)).activeSeconds).toBe(40 + 20 + 10);
  });

  it('ignores out-of-order timestamps and never goes negative', () => {
    let st = recordInteraction(startSession(s(10)), s(20));
    st = recordInteraction(st, s(5));
    const session = endSession(st, s(0)); // end before start → clamped to start
    expect(session.activeSeconds).toBe(10);
    expect(session.endedAt).toBe(s(10));
  });

  it('tags the session mode', () => {
    expect(endSession(startSession(0), s(10), 'listen').mode).toBe('listen');
  });
});
