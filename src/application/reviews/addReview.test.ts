import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAddReview } from "./addReview";
import type { ReviewRepo, DomainReview } from "../ports/ReviewRepo";
import type { BookRepo, DomainBook } from "../ports/BookRepo";
import type { Clock } from "../ports/Clock";

// ──────────────────────────────────────────────
// Fake implementations
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
  totalReviews: 1,
  createdAt: new Date("2026-01-01"),
};

const makeFakeBookRepo = (book = stubBook): BookRepo => ({
  findAll: vi.fn().mockResolvedValue([book]),
  findById: vi.fn().mockResolvedValue(book),
  create: vi.fn().mockResolvedValue("new-id"),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeFakeReviewRepo = (): ReviewRepo => ({
  findByBookId: vi.fn().mockResolvedValue([]),
  findByUserAndBook: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue("review-new"),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeFakeClock = (date = new Date("2026-04-11")): Clock => ({
  now: () => date,
});

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("addReview use case", () => {
  let bookRepo: BookRepo;
  let reviewRepo: ReviewRepo;
  let addReview: ReturnType<typeof makeAddReview>;

  beforeEach(() => {
    bookRepo = makeFakeBookRepo();
    reviewRepo = makeFakeReviewRepo();
    addReview = makeAddReview({ bookRepo, reviewRepo, clock: makeFakeClock() });
  });

  it("returns the new review id on success", async () => {
    const result = await addReview({
      bookId: "book-1",
      userId: "user-1",
      userName: "Alice",
      rating: 5,
      comment: "Excellent!",
    });
    expect(result).toBe("review-new");
  });

  it("throws AlreadyReviewedError (code ALREADY_REVIEWED) when user reviewed before", async () => {
    const existing: DomainReview = {
      id: "existing-review",
      bookId: "book-1",
      userId: "user-1",
      userName: "Alice",
      rating: 3,
      comment: "ok",
      createdAt: new Date("2026-01-01"),
    };
    vi.mocked(reviewRepo.findByUserAndBook).mockResolvedValueOnce(existing);

    await expect(
      addReview({
        bookId: "book-1",
        userId: "user-1",
        userName: "Alice",
        rating: 5,
        comment: "great",
      }),
    ).rejects.toMatchObject({ code: "ALREADY_REVIEWED" });
  });

  it("calls reviewRepo.create with the correct fields", async () => {
    await addReview({
      bookId: "book-1",
      userId: "user-1",
      userName: "Alice",
      rating: 5,
      comment: "Excellent!",
    });

    expect(reviewRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: "book-1",
        userId: "user-1",
        rating: 5,
        comment: "Excellent!",
      }),
    );
  });

  it("updates book aggregate rating after adding a review", async () => {
    // stubBook: averageRating=4, totalReviews=1, newRating=2 → newAvg=3, total=2
    await addReview({
      bookId: "book-1",
      userId: "user-1",
      userName: "Alice",
      rating: 2,
      comment: "meh",
    });

    expect(bookRepo.update).toHaveBeenCalledWith(
      "book-1",
      expect.objectContaining({
        averageRating: 3,
        totalReviews: 2,
      }),
    );
  });

  it("throws BookNotFoundError (code BOOK_NOT_FOUND) when book does not exist", async () => {
    vi.mocked(bookRepo.findById).mockResolvedValueOnce(null);

    await expect(
      addReview({
        bookId: "missing-book",
        userId: "user-1",
        userName: "Alice",
        rating: 5,
        comment: "great",
      }),
    ).rejects.toMatchObject({ code: "BOOK_NOT_FOUND" });
  });
});
