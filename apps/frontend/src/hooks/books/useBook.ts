import { useQuery } from "@tanstack/react-query";
import { getBookById } from "@/services/bookService";
import { queryKeys } from "@/lib/queryKeys";

/**
 * A single book by id.
 *
 * Replaces `useBooks(id)`, which also fired an unfiltered list query on every
 * consumer — so pages that needed one book (Reader, AddBook) were pulling a
 * 20-book payload they never read.
 */
export const useBook = (bookId?: string) => {
  const query = useQuery({
    queryKey: queryKeys.books.detail(bookId),
    queryFn: () => getBookById(bookId!),
    enabled: !!bookId,
  });

  return {
    book: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
