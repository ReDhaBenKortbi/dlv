import type { BookRepo, DomainBook } from "../ports/BookRepo";

export function makeListBooks(bookRepo: BookRepo) {
  return function listBooks(): Promise<DomainBook[]> {
    return bookRepo.findAll();
  };
}
