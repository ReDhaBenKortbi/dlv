/** Domain entity — uses Date, never Firebase Timestamp. */
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

export interface ReviewRepo {
  findByBookId(bookId: string): Promise<DomainReview[]>;
  findByUserAndBook(bookId: string, userId: string): Promise<DomainReview | null>;
  create(input: CreateReviewInput): Promise<string>;
  delete(reviewId: string): Promise<void>;
}
