import { api } from "../lib/api";
import type { Review, NewReviewData } from "../types/Review";

export interface ReviewsMeta {
  total: number;
  page: number;
  limit: number;
}

export const getReviewsByBookId = (
  bookId: string,
  page = 1,
  limit = 9,
): Promise<{ data: Review[]; meta: ReviewsMeta }> =>
  api(`/books/${bookId}/reviews?page=${page}&limit=${limit}`);

export const addReview = (reviewData: NewReviewData): Promise<Review> =>
  api(`/books/${reviewData.bookId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating: reviewData.rating, body: reviewData.body }),
  });

// Independent of pagination — hits a dedicated endpoint rather than
// scanning whichever page of reviews happens to be loaded.
export const getUserReviewForBook = (bookId: string): Promise<Review | null> =>
  api(`/books/${bookId}/reviews/mine`);

export const deleteReview = (reviewId: string, bookId: string): Promise<null> =>
  api(`/books/${bookId}/reviews/${reviewId}`, { method: "DELETE" });
