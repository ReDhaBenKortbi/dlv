// src/hooks/books/useBooks.ts

import { useQuery } from "@tanstack/react-query";
import { getBooks, getBookById } from "../../services/bookService";
import { useSearch } from "../../context/SearchContext";
import { useMemo } from "react";

// Update arguments: instead of 'category', we accept the whole 'book' object for better context
export const useBooks = (bookId?: string, currentBook?: any) => {
  const { searchTerm } = useSearch();

  const allBooksQuery = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const singleBookQuery = useQuery({
    queryKey: ["books", bookId],
    queryFn: () => getBookById(bookId!),
    enabled: !!bookId,
  });

  const filteredBooks = useMemo(() => {
    const data = allBooksQuery.data ?? [];
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((b) => b.title.toLowerCase().includes(term));
  }, [allBooksQuery.data, searchTerm]);

  // --- UPDATED SMART RECOMMENDATIONS ---
  const relatedBooks = useMemo(() => {
    if (!currentBook || !bookId || !allBooksQuery.data) return [];

    return allBooksQuery.data
      .filter((b) => {
        // 1. Don't show the current book itself
        if (b.id === bookId) return false;

        // 2. Logic: Prioritize same language
        // If we have a targetLanguage, match it.
        // If not, fallback to the old category system.
        if (currentBook.targetLanguage) {
          return b.targetLanguage === currentBook.targetLanguage;
        }

        return b.category === currentBook.category;
      })
      .slice(0, 4);
  }, [allBooksQuery.data, currentBook, bookId]);

  return {
    books: filteredBooks,
    book: singleBookQuery.data,
    relatedBooks,
    isLoading: allBooksQuery.isLoading || singleBookQuery.isLoading,
    isError: allBooksQuery.isError || singleBookQuery.isError,
    error: allBooksQuery.error || singleBookQuery.error,
  };
};
