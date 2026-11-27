import { describe, expect, it } from 'vitest';
import { estimateMinutes } from './reading-time';

describe('estimateMinutes', () => {
  it('rounds up to whole minutes', () => {
    expect(estimateMinutes(230)).toBe(1);
    expect(estimateMinutes(231)).toBe(2);
    expect(estimateMinutes(2300)).toBe(10);
  });

  it('returns at least 1 minute', () => {
    expect(estimateMinutes(0)).toBe(1);
    expect(estimateMinutes(-5)).toBe(1);
    expect(estimateMinutes(Number.NaN)).toBe(1);
  });
});
