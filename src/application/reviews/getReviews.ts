import type { ReviewRepo, DomainReview } from "../ports/ReviewRepo";

export function makeGetReviewsByBook(reviewRepo: ReviewRepo) {
  return function getReviewsByBook(bookId: string): Promise<DomainReview[]> {
    return reviewRepo.findByBookId(bookId);
  };
}
