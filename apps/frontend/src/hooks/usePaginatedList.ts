import { useState } from "react";
import { getTotalPages } from "@/lib/pagination";
import type { PageMeta } from "@/types/pagination";

/**
 * Page state for a server-paginated list.
 *
 * Split across a hook call and a `syncMeta` call because the two halves sit on
 * opposite sides of the query: `page` is an *input* to it, while `meta` only
 * comes back as a *result*. So the filter reset has to happen before the query
 * runs, and the clamp can only happen after it returns.
 *
 *   const { page, setPage, syncMeta } = usePaginatedList(filterKey);
 *   const { rows, meta } = useSomeList({ page, limit });
 *   const totalPages = syncMeta(meta);
 *
 * Replaces six near-identical copies of this logic (Library, BooksManager,
 * UsersManager, SubscribersHistory, AdminTicketList, ReviewList).
 *
 * @param filterKey Serialised filter/search state; any change resets to page 1.
 *                  Omit for lists with no filters.
 */
export function usePaginatedList(filterKey = "") {
  const [page, setPage] = useState(1);
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);

  // Adjusting state during render rather than in an effect is React's
  // recommended way to derive state from changed inputs, and avoids the extra
  // render-and-commit round trip an effect would cost.
  //
  // Resetting *before* the query also means the request that follows a filter
  // change already asks for page 1 — the previous inline version reset after
  // the query had fired, so every filter change cost a wasted request.
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey);
    setPage(1);
  }

  /**
   * Feed the response metadata back in; returns the page count.
   *
   * If the data shrank (a deletion, a narrower filter) and the current page no
   * longer exists, falls back to the last valid page.
   */
  const syncMeta = (meta: PageMeta | undefined): number => {
    const totalPages = meta ? getTotalPages(meta.total, meta.limit) : 1;

    // Skip while a filter change is still settling: `meta` then describes the
    // previous filter, so its page count is stale and would clamp against the
    // wrong total.
    if (meta && filterKey === appliedFilterKey && page > totalPages) {
      setPage(totalPages);
    }
    return totalPages;
  };

  return { page, setPage, syncMeta };
}
