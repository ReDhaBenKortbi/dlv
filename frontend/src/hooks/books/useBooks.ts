import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import { useSearch } from "../../context/SearchContext";
import type { DomainBook } from "../../application/ports/BookRepo";

export const useBooks = (bookId?: string, currentBook?: DomainBook) => {
  const { listBooks, getBook } = useUseCases();
  const { searchTerm } = useSearch();

  const allBooksQuery = useQuery({
    queryKey: ["books"],
    queryFn: listBooks,
  });

  const singleBookQuery = useQuery({
    queryKey: ["books", bookId],
    queryFn: () => getBook(bookId!),
    enabled: !!bookId,
  });

  const filteredBooks = useMemo(() => {
    const data = allBooksQuery.data ?? [];
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((b) => b.title.toLowerCase().includes(term));
  }, [allBooksQuery.data, searchTerm]);

  const relatedBooks = useMemo(() => {
    if (!currentBook || !bookId || !allBooksQuery.data) return [];

    return allBooksQuery.data
      .filter((b) => {
        if (b.id === bookId) return false;
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
