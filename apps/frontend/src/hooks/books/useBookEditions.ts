import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBooks } from "@/services/bookService";
import { queryKeys } from "@/lib/queryKeys";
import { TIER_RANK } from "@/lib/tierStyles";
import type { Book } from "@/types/book";

// A title's edition ladder is at most one row per tier; 50 is headroom, not a page size.
const EDITIONS_LIMIT = 50;

/**
 * Every tier edition of one title, ordered FREE -> PRO -> GOLD.
 *
 * Asks the API for the `groupKey` directly. The previous implementation
 * filtered the default (20-item, newest-first) list response client-side, so
 * any title outside that window silently lost its siblings.
 */
export const useBookEditions = (book: Book | undefined) => {
  const groupKey = book?.groupKey;

  const query = useQuery({
    queryKey: queryKeys.books.editions(groupKey),
    queryFn: () => getBooks({ groupKey, raw: true, limit: EDITIONS_LIMIT }),
    enabled: !!groupKey,
  });

  const editions = useMemo(() => {
    if (!book) return [];
    // An ungrouped book is a series of one.
    if (!groupKey) return [book];

    const fetched = query.data?.data;
    if (!fetched) return [book];

    // The list endpoint strips `indexURL`, so prefer the fully-loaded current
    // edition over the summary row the list returned for it.
    const merged = fetched.map((e) => (e.id === book.id ? book : e));
    if (!merged.some((e) => e.id === book.id)) merged.push(book);

    return merged.sort((a, b) => TIER_RANK[a.bookTier] - TIER_RANK[b.bookTier]);
  }, [book, groupKey, query.data]);

  // Explicit rather than leaning on query.isLoading being false for a disabled
  // query: an ungrouped book never fetches, so it is never "loading".
  return { editions, isLoading: !!groupKey && query.isLoading };
};
