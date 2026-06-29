import { api } from "../lib/api";
import type { Book } from "../types/book";

export const getBooks = (): Promise<{ data: Book[]; meta: unknown }> =>
  api("/books");

export const getBookById = (id: string): Promise<Book> =>
  api(`/books/${id}`);

export const createBook = (newBook: Omit<Book, "id" | "createdAt">): Promise<Book> =>
  api("/books", { method: "POST", body: JSON.stringify(newBook) });

export const updateBook = (id: string, updates: Partial<Book>): Promise<Book> =>
  api(`/books/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

export const deleteBook = (id: string): Promise<null> =>
  api(`/books/${id}`, { method: "DELETE" });
