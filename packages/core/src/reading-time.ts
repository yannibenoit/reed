/** Average reading speed used for estimates (words per minute). */
export const WORDS_PER_MINUTE = 230;

/** Estimated reading time in minutes: ceil(words / 230), minimum 1 (FR-6). */
export function estimateMinutes(wordCount: number): number {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
