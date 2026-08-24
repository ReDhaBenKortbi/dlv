import { api } from "../lib/api";
import type { Book } from "../types/book";

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

export interface BooksMeta {
  total: number;
  page: number;
  limit: number;
}

export const getBooks = (
  query: BooksQuery = {},
): Promise<{ data: Book[]; meta: BooksMeta }> => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return api(`/books${qs ? `?${qs}` : ""}`);
};

export const getBookById = (id: string): Promise<Book> =>
  api(`/books/${id}`);

export const createBook = (newBook: Omit<Book, "id" | "createdAt">): Promise<Book> =>
  api("/books", { method: "POST", body: JSON.stringify(newBook) });

export const updateBook = (id: string, updates: Partial<Book>): Promise<Book> =>
  api(`/books/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

export const deleteBook = (id: string): Promise<null> =>
  api(`/books/${id}`, { method: "DELETE" });
