import type { ReviewRepo } from "../ports/ReviewRepo";
import type { BookRepo } from "../ports/BookRepo";
import { BookNotFoundError, ReviewNotFoundError } from "../../domain/shared/errors";
import { computeRatingAfterDeletion } from "../../domain/review/rating";

interface DeleteReviewDeps {
  reviewRepo: ReviewRepo;
  bookRepo: BookRepo;
}

interface DeleteReviewInput {
  reviewId: string;
  bookId: string;
}

export function makeDeleteReview(deps: DeleteReviewDeps) {
  return async function deleteReview(input: DeleteReviewInput): Promise<void> {
    const { reviewRepo, bookRepo } = deps;
    const { reviewId, bookId } = input;

    const book = await bookRepo.findById(bookId);
    if (!book) throw new BookNotFoundError(bookId);

    const review = await reviewRepo.findByBookId(bookId).then((reviews) =>
      reviews.find((r) => r.id === reviewId) ?? null,
    );
    if (!review) throw new ReviewNotFoundError(reviewId);

    const prevTotal = book.totalReviews ?? 0;
    const prevAvg = book.averageRating ?? 0;
    const newTotal = Math.max(0, prevTotal - 1);
    const newAvg = computeRatingAfterDeletion(prevAvg, prevTotal, review.rating);

    await reviewRepo.delete(reviewId);
    await bookRepo.updateRating(bookId, newAvg, newTotal);
  };
}

export type { DeleteReviewDeps, DeleteReviewInput };
