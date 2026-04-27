import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeDeleteReview } from "./deleteReview";
import type { ReviewRepo, DomainReview } from "../ports/ReviewRepo";
import type { BookRepo, DomainBook } from "../ports/BookRepo";

// ──────────────────────────────────────────────
// Fakes
// ──────────────────────────────────────────────

const stubBook: DomainBook = {
  id: "book-1",
  title: "Test Book",
  author: "Author",
  description: "desc",
  coverURL: "https://example.com/cover.jpg",
  indexURL: "https://example.com/index.html",
  isPremium: false,
  averageRating: 4,
  totalReviews: 2,
  createdAt: new Date("2026-01-01"),
};

const stubReview: DomainReview = {
  id: "review-1",
  bookId: "book-1",
  userId: "user-1",
  userName: "Alice",
  rating: 5,
  comment: "Great!",
  createdAt: new Date("2026-01-01"),
};

const makeFakeBookRepo = (book = stubBook): BookRepo => ({
  findAll: vi.fn().mockResolvedValue([book]),
  findById: vi.fn().mockResolvedValue(book),
  create: vi.fn().mockResolvedValue("new-id"),
  update: vi.fn().mockResolvedValue(undefined),
  updateRating: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  uploadBookContent: vi.fn().mockResolvedValue(undefined),
});

const makeFakeReviewRepo = (reviews: DomainReview[] = [stubReview]): ReviewRepo => ({
  findByBookId: vi.fn().mockResolvedValue(reviews),
  findByUserAndBook: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue("review-new"),
  delete: vi.fn().mockResolvedValue(undefined),
});

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("deleteReview use case", () => {
  let bookRepo: BookRepo;
  let reviewRepo: ReviewRepo;
  let deleteReview: ReturnType<typeof makeDeleteReview>;

  beforeEach(() => {
    bookRepo = makeFakeBookRepo();
    reviewRepo = makeFakeReviewRepo();
    deleteReview = makeDeleteReview({ bookRepo, reviewRepo });
  });

  it("deletes the review and calls updateRating (not update)", async () => {
    await deleteReview({ reviewId: "review-1", bookId: "book-1" });

    expect(reviewRepo.delete).toHaveBeenCalledWith("review-1");
    expect(bookRepo.updateRating).toHaveBeenCalledOnce();
    // Critically: generic update() must NOT be called — it injects updatedAt
    // which violates the Firestore rule hasOnly(['averageRating','totalReviews'])
    expect(bookRepo.update).not.toHaveBeenCalled();
  });

  it("recalculates aggregate rating correctly after deletion", async () => {
    // stubBook: avg=4, total=2; removing rating=5 → newAvg=(4*2-5)/1=3, newTotal=1
    await deleteReview({ reviewId: "review-1", bookId: "book-1" });

    expect(bookRepo.updateRating).toHaveBeenCalledWith("book-1", 3, 1);
  });

  it("sets rating to 0 and total to 0 when the last review is deleted", async () => {
    const singleBook: DomainBook = {
      ...stubBook,
      averageRating: 5,
      totalReviews: 1,
    };
    bookRepo = makeFakeBookRepo(singleBook);
    deleteReview = makeDeleteReview({ bookRepo, reviewRepo });

    await deleteReview({ reviewId: "review-1", bookId: "book-1" });

    expect(bookRepo.updateRating).toHaveBeenCalledWith("book-1", 0, 0);
  });

  it("throws BookNotFoundError when book does not exist", async () => {
    vi.mocked(bookRepo.findById).mockResolvedValueOnce(null);

    await expect(
      deleteReview({ reviewId: "review-1", bookId: "missing" }),
    ).rejects.toMatchObject({ code: "BOOK_NOT_FOUND" });
  });

  it("throws ReviewNotFoundError when review does not exist in the book", async () => {
    reviewRepo = makeFakeReviewRepo([]); // no reviews found
    deleteReview = makeDeleteReview({ bookRepo, reviewRepo });

    await expect(
      deleteReview({ reviewId: "review-999", bookId: "book-1" }),
    ).rejects.toMatchObject({ code: "REVIEW_NOT_FOUND" });
  });
});
