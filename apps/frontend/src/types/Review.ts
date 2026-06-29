export interface ReviewUser {
  id: string;
  email: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  body?: string;
  createdAt: string;
  user: ReviewUser;
}

export type NewReviewData = {
  bookId: string;
  rating: number;
  body?: string;
};
