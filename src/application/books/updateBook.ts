import type { BookRepo, DomainBook } from "../ports/BookRepo";

export function makeUpdateBook(bookRepo: BookRepo) {
  return function updateBook(
    id: string,
    updates: Partial<Omit<DomainBook, "id">>,
  ): Promise<void> {
    return bookRepo.update(id, updates);
  };
}
