import { apiClient } from './ApiClient';
import type { ReviewRepo, DomainReview, CreateReviewInput } from '../../application/ports/ReviewRepo';

interface ApiReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function toReview(api: ApiReview): DomainReview {
  return {
    id: api.id,
    bookId: api.bookId,
    userId: api.userId,
    userName: api.userName,
    rating: api.rating,
    comment: api.comment,
    createdAt: new Date(api.createdAt),
  };
}

export function makeApiReviewRepo(): ReviewRepo {
  return {
    async findByBookId(bookId: string): Promise<DomainReview[]> {
      const reviews = await apiClient.get<ApiReview[]>(`/books/${bookId}/reviews`);
      return reviews.map(toReview);
    },

    async findByUserAndBook(bookId: string, _userId: string): Promise<DomainReview | null> {
      const review = await apiClient.get<ApiReview | null>(`/books/${bookId}/reviews/mine`);
      return review ? toReview(review) : null;
    },

    async create(input: CreateReviewInput): Promise<string> {
      const review = await apiClient.post<ApiReview>(
        `/books/${input.bookId}/reviews`,
        { rating: input.rating, comment: input.comment },
      );
      return review.id;
    },

    async delete(reviewId: string): Promise<void> {
      await apiClient.delete(`/reviews/${reviewId}`);
    },
  };
}
