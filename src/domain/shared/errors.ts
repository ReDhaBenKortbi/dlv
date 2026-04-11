/**
 * Base class for all domain errors.
 * Throw these from use cases; infrastructure adapters re-throw them
 * so the presentation layer never has to import Firebase error types.
 */
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    // Restore prototype chain for instanceof checks in transpiled output
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BookNotFoundError extends DomainError {
  constructor(id: string) {
    super("BOOK_NOT_FOUND", `Book '${id}' was not found`);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "You are not authorized to perform this action") {
    super("UNAUTHORIZED", message);
  }
}

export class ValidationError extends DomainError {
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message);
    this.details = details;
  }
}

export class AlreadyReviewedError extends DomainError {
  constructor() {
    super("ALREADY_REVIEWED", "User has already reviewed this book");
  }
}

export class ReviewNotFoundError extends DomainError {
  constructor(id: string) {
    super("REVIEW_NOT_FOUND", `Review '${id}' was not found`);
  }
}
