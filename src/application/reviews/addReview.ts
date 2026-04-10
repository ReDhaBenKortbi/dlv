import type { ReviewRepo, CreateReviewInput } from "../ports/ReviewRepo";
import type { BookRepo } from "../ports/BookRepo";
import type { Clock } from "../ports/Clock";

interface AddReviewDeps {
  reviewRepo: ReviewRepo;
  bookRepo: BookRepo;
  clock: Clock;
}

interface AddReviewInput {
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

/**
 * Add a review for a book and update the book's aggregate rating.
 * Phase 0: stub — use cases are not yet implemented; tests will be RED.
 * Phase 3: replace with real implementation.
 */
export function makeAddReview(_deps: AddReviewDeps) {
  return async function addReview(_input: AddReviewInput): Promise<string> {
    return ""; // stub
  };
}

export type { AddReviewDeps, AddReviewInput };
export type { CreateReviewInput };
