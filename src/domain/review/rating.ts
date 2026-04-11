/**
 * Rating calculation — pure functions, no Firebase, no React.
 *
 * Phase 0: stubs — return placeholder values so tests compile.
 * Phase 1: replace with real implementations (tests will go GREEN).
 */

/**
 * Computes the new average rating after adding a review.
 * Safe when prevTotal is 0 (first review).
 */
export function computeNewAverageRating(
  prevAvg: number,
  prevTotal: number,
  newRating: number,
): number {
  if (prevTotal === 0) return newRating;
  return (prevAvg * prevTotal + newRating) / (prevTotal + 1);
}

/**
 * Computes the new average rating after removing a review.
 * Returns 0 when the deleted review was the only one.
 * Never returns a negative value.
 */
export function computeRatingAfterDeletion(
  prevAvg: number,
  prevTotal: number,
  removedRating: number,
): number {
  if (prevTotal <= 1) return 0;
  return Math.max(0, (prevAvg * prevTotal - removedRating) / (prevTotal - 1));
}
