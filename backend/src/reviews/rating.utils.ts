/** Reused from frontend domain/review/rating.ts — pure functions, no deps */

export function computeNewAverageRating(
  currentAverage: number,
  currentTotal: number,
  newRating: number,
): number {
  if (currentTotal === 0) return newRating;
  return (currentAverage * currentTotal + newRating) / (currentTotal + 1);
}

export function computeRatingAfterDeletion(
  currentAverage: number,
  currentTotal: number,
  deletedRating: number,
): number {
  if (currentTotal <= 1) return 0;
  return (currentAverage * currentTotal - deletedRating) / (currentTotal - 1);
}
