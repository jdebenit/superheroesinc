/**
 * Calculates the average reading time in minutes for a given text.
 * Assumes a reading speed of 200 words per minute for Spanish text.
 * Returns a minimum of 1 minute.
 */
export function getReadingTime(text: string | undefined): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
