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
  _prevAvg: number,
  _prevTotal: number,
  _newRating: number,
): number {
  return 0; // stub — tests will be RED
}

/**
 * Computes the new average rating after removing a review.
 * Returns 0 when the deleted review was the only one.
 * Never returns a negative value.
 */
export function computeRatingAfterDeletion(
  _prevAvg: number,
  _prevTotal: number,
  _removedRating: number,
): number {
  return 0; // stub — tests will be RED
}
