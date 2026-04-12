import type { BookRepo } from "../ports/BookRepo";

export function makeDeleteBook(bookRepo: BookRepo) {
  return function deleteBook(id: string): Promise<void> {
    return bookRepo.delete(id);
  };
}
