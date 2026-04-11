import type { ReviewRepo, CreateReviewInput } from "../ports/ReviewRepo";
import type { BookRepo } from "../ports/BookRepo";
import type { Clock } from "../ports/Clock";
import { AlreadyReviewedError, BookNotFoundError } from "../../domain/shared/errors";
import { computeNewAverageRating } from "../../domain/review/rating";

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

export function makeAddReview(deps: AddReviewDeps) {
  return async function addReview(input: AddReviewInput): Promise<string> {
    const { bookRepo, reviewRepo } = deps;
    const { bookId, userId, userName, rating, comment } = input;

    const book = await bookRepo.findById(bookId);
    if (!book) throw new BookNotFoundError(bookId);

    const existing = await reviewRepo.findByUserAndBook(bookId, userId);
    if (existing) throw new AlreadyReviewedError();

    const reviewId = await reviewRepo.create({
      bookId,
      userId,
      userName,
      rating,
      comment,
    });

    const prevTotal = book.totalReviews ?? 0;
    const newAvg = computeNewAverageRating(book.averageRating ?? 0, prevTotal, rating);
    await bookRepo.update(bookId, {
      averageRating: newAvg,
      totalReviews: prevTotal + 1,
    });

    return reviewId;
  };
}

export type { AddReviewDeps, AddReviewInput };
export type { CreateReviewInput };
