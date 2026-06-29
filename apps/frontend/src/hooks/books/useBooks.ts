// src/hooks/books/useBooks.ts

import { useQuery } from "@tanstack/react-query";
import { getBooks, getBookById } from "../../services/bookService";
import { useSearch } from "../../context/SearchContext";
import { useMemo } from "react";
import type { Book } from "../../types/book";

export const useBooks = (bookId?: string, currentBook?: Book) => {
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
    const data = allBooksQuery.data?.data ?? [];
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((b) => b.title.toLowerCase().includes(term));
  }, [allBooksQuery.data, searchTerm]);

  // --- UPDATED SMART RECOMMENDATIONS ---
  const relatedBooks = useMemo(() => {
    const allData = allBooksQuery.data?.data;
    if (!currentBook || !bookId || !allData) return [];

    return allData
      .filter((b) => {
        // 1. Don't show the current book itself
        if (b.id === bookId) return false;

        // 2. Logic: recommend books that share the same target language.
        if (!currentBook.targetLanguage) return false;
        return b.targetLanguage === currentBook.targetLanguage;
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
