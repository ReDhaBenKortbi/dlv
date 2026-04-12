import { describe, it, expect } from "vitest";
import {
  DomainError,
  BookNotFoundError,
  UnauthorizedError,
  ValidationError,
  AlreadyReviewedError,
} from "./errors";

describe("DomainError", () => {
  it("is an instance of Error", () => {
    const err = new DomainError("UNKNOWN", "Something went wrong");
    expect(err).toBeInstanceOf(Error);
  });

  it("carries the error code", () => {
    const err = new DomainError("TEST_CODE", "msg");
    expect(err.code).toBe("TEST_CODE");
  });

  it("has the correct message", () => {
    const err = new DomainError("X", "hello");
    expect(err.message).toBe("hello");
  });

  it("supports instanceof checks reliably", () => {
    const err = new BookNotFoundError("abc");
    expect(err instanceof DomainError).toBe(true);
    expect(err instanceof BookNotFoundError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});

describe("BookNotFoundError", () => {
  it("has code BOOK_NOT_FOUND", () => {
    const err = new BookNotFoundError("book-123");
    expect(err.code).toBe("BOOK_NOT_FOUND");
  });

  it("includes the book id in the message", () => {
    const err = new BookNotFoundError("book-123");
    expect(err.message).toContain("book-123");
  });
});

describe("UnauthorizedError", () => {
  it("has code UNAUTHORIZED", () => {
    const err = new UnauthorizedError();
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("accepts a custom message", () => {
    const err = new UnauthorizedError("premium required");
    expect(err.message).toBe("premium required");
  });
});

describe("ValidationError", () => {
  it("has code VALIDATION_ERROR", () => {
    const err = new ValidationError("Title is required");
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("carries field-level error details", () => {
    const err = new ValidationError("Title is required", { field: "title" });
    expect(err.details).toEqual({ field: "title" });
  });
});

describe("AlreadyReviewedError", () => {
  it("has code ALREADY_REVIEWED", () => {
    const err = new AlreadyReviewedError();
    expect(err.code).toBe("ALREADY_REVIEWED");
  });
});
