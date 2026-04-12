import type { BookRepo, CreateBookInput } from "../ports/BookRepo";

export function makeCreateBook(bookRepo: BookRepo) {
  return function createBook(input: CreateBookInput): Promise<string> {
    return bookRepo.create(input);
  };
}
