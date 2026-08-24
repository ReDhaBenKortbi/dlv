import { useState } from "react";
import { getTotalPages } from "@/lib/pagination";

interface PaginationMeta {
  total: number;
  limit: number;
}

interface UsePaginatedListOptions {
  /** Server pagination metadata; `undefined` while the first request is in flight. */
  meta: PaginationMeta | undefined;
  /**
   * Serialised filter/search state. Whenever it changes, the list resets to
   * page 1. Omit for lists that have no filters.
   */
  filterKey?: string;
}

/**
 * Page state for a server-paginated list: the current page, the derived page
 * count, a reset when filters change, and a clamp when the data shrinks.
 *
 * Replaces six near-identical copies of this logic (Library, BooksManager,
 * UsersManager, SubscribersHistory, AdminTicketList, ReviewList).
 */
export function usePaginatedList({
  meta,
  filterKey = "",
}: UsePaginatedListOptions) {
  const [page, setPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  const totalPages = meta ? getTotalPages(meta.total, meta.limit) : 1;

  // Both branches adjust state *during render* rather than in an effect —
  // React's recommended pattern for deriving state from changed inputs, and it
  // avoids the extra render-and-commit round trip an effect would cost.
  if (filterKey !== prevFilterKey) {
    // A filter/search change always takes priority over the clamp below:
    // `meta` still describes the previous filter, so `totalPages` is stale here.
    setPrevFilterKey(filterKey);
    setPage(1);
  } else if (meta && page > totalPages) {
    // The data shrank (e.g. a deletion) and the current page no longer exists —
    // fall back to the last valid page.
    setPage(totalPages);
  }

  return { page, setPage, totalPages };
}
