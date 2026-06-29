import { api } from "../lib/api";
import type { Review, NewReviewData } from "../types/Review";

export const getReviewsByBookId = (bookId: string): Promise<Review[]> =>
  api(`/books/${bookId}/reviews`);

export const addReview = (reviewData: NewReviewData): Promise<Review> =>
  api(`/books/${reviewData.bookId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating: reviewData.rating, body: reviewData.body }),
  });

export const getUserReviewForBook = async (
  bookId: string,
  userId: string,
): Promise<Review | null> => {
  const reviews = await getReviewsByBookId(bookId);
  return reviews.find((r) => r.userId === userId) ?? null;
};

export const deleteReview = (reviewId: string, bookId: string): Promise<null> =>
  api(`/books/${bookId}/reviews/${reviewId}`, { method: "DELETE" });
