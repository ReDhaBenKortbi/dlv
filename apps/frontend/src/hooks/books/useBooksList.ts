// src/hooks/books/useBooksList.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getBooks } from "@/services/bookService";
import type { BooksQuery } from "@/services/bookService";
import { queryKeys } from "@/lib/queryKeys";

export const useBooksList = (params: BooksQuery) => {
  const query = useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => getBooks(params),
    placeholderData: keepPreviousData,
  });

  return {
    books: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};
