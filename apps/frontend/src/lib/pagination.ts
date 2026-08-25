/**
 * How many pages a list has, given a total and a page size.
 *
 * Always at least 1, so an empty list still renders as "page 1 of 1" rather
 * than "page 1 of 0". Used by `usePaginatedList` and the Pagination component,
 * which previously each did this arithmetic themselves.
 */
export const getTotalPages = (total: number, limit: number): number =>
  limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
