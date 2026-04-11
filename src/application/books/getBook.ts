import type { BookRepo, DomainBook } from "../ports/BookRepo";
import { BookNotFoundError } from "../../domain/shared/errors";

export function makeGetBook(bookRepo: BookRepo) {
  return async function getBook(id: string): Promise<DomainBook> {
    const book = await bookRepo.findById(id);
    if (!book) throw new BookNotFoundError(id);
    return book;
  };
}
