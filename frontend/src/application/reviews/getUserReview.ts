import type { ReviewRepo, DomainReview } from "../ports/ReviewRepo";

export function makeGetUserReview(reviewRepo: ReviewRepo) {
  return function getUserReview(
    bookId: string,
    userId: string,
  ): Promise<DomainReview | null> {
    return reviewRepo.findByUserAndBook(bookId, userId);
  };
}
