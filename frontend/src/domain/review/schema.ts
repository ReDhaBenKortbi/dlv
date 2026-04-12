// Pure domain Review type — no Firebase, no Timestamps.

export interface DomainReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number; // 1–5
  comment: string;
  createdAt: Date;
}

export type CreateReviewInput = Omit<DomainReview, "id" | "createdAt">;
