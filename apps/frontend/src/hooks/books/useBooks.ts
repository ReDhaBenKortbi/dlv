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

    const candidates = allData.filter((b) => {
      // 1. Don't show the current book itself
      if (b.id === bookId) return false;

      // 2. Logic: recommend books that share the same target language.
      if (!currentBook.targetLanguage) return false;
      return b.targetLanguage === currentBook.targetLanguage;
    });

    // Pick up to 4 distinct titles (not raw editions) so a 3-tier series
    // doesn't eat 3 of the 4 recommendation slots — then keep every
    // edition of those titles so the caller can group them back into cards.
    const chosenKeys: string[] = [];
    for (const b of candidates) {
      const key = b.groupKey || b.id;
      if (!chosenKeys.includes(key) && chosenKeys.length < 4) {
        chosenKeys.push(key);
      }
    }
    return candidates.filter((b) => chosenKeys.includes(b.groupKey || b.id));
  }, [allBooksQuery.data, currentBook, bookId]);

  // Other tier editions of the same title, so the detail page can show the
  // full access ladder instead of just the one edition in the URL.
  const groupEditions = useMemo(() => {
    const allData = allBooksQuery.data?.data;
    if (!currentBook || !allData) return currentBook ? [currentBook] : [];
    if (!currentBook.groupKey) return [currentBook];

    const siblings = allData.filter((b) => b.groupKey === currentBook.groupKey);
    // The list query may not include the currently-viewed edition (e.g. it's
    // outside the default page/limit), so make sure it's always present.
    return siblings.some((b) => b.id === currentBook.id)
      ? siblings
      : [...siblings, currentBook];
  }, [allBooksQuery.data, currentBook]);

  return {
    books: filteredBooks,
    book: singleBookQuery.data,
    relatedBooks,
    groupEditions,
    isLoading: allBooksQuery.isLoading || singleBookQuery.isLoading,
    isError: allBooksQuery.isError || singleBookQuery.isError,
    error: allBooksQuery.error || singleBookQuery.error,
  };
};
