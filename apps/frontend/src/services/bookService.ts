import { api } from "../lib/api";
import { buildQuery } from "../lib/qs";
import type { Book } from "../types/book";
import type { Paginated } from "../types/pagination";

export interface BooksQuery {
  page?: number;
  limit?: number;
  targetLanguage?: string;
  focusSkill?: string[];
  proficiencyLevel?: string[];
  search?: string;
  /** Fetch every tier edition of one title. Always served ungrouped. */
  groupKey?: string;
  /** Row-level (ungrouped) pagination — used by the admin book table. */
  raw?: boolean;
}

export const getBooks = (query: BooksQuery = {}): Promise<Paginated<Book>> =>
  api(`/books${buildQuery(query)}`);

export const getBookById = (id: string): Promise<Book> =>
  api(`/books/${id}`);

export const createBook = (newBook: Omit<Book, "id" | "createdAt">): Promise<Book> =>
  api("/books", { method: "POST", body: JSON.stringify(newBook) });

export const updateBook = (id: string, updates: Partial<Book>): Promise<Book> =>
  api(`/books/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

export const deleteBook = (id: string): Promise<null> =>
  api(`/books/${id}`, { method: "DELETE" });
