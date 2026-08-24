/**
 * Single source of truth for every React Query key in the app.
 *
 * Before this existed the keys were written inline at each call site and had
 * drifted into three casing styles (`["dashboardMetrics"]`, `["payment-history"]`,
 * `["userReview"]`) with overlapping prefixes that made invalidation hard to
 * reason about. Add new keys here rather than inline.
 *
 * Convention: every entry starts with its domain, so `invalidateQueries({
 * queryKey: queryKeys.books.all })` reliably clears every books-derived query.
 */

export const queryKeys = {
  books: {
    /** Prefix covering every books query — use for blanket invalidation. */
    all: ["books"] as const,
    list: (params: unknown) => ["books", "list", params] as const,
    detail: (id: string | undefined) => ["books", "detail", id] as const,
    /** Sibling tier editions sharing a `groupKey`. */
    editions: (groupKey: string | undefined) =>
      ["books", "editions", groupKey] as const,
    /** Recommendations for a book, keyed by the language they share. */
    related: (targetLanguage: string | undefined) =>
      ["books", "related", targetLanguage] as const,
  },

  users: {
    all: ["users"] as const,
    list: (params: unknown) => ["users", "list", params] as const,
  },

  reviews: {
    /** Prefix for one book's reviews — covers both the list and the user's own. */
    forBook: (bookId: string) => ["reviews", bookId] as const,
    list: (bookId: string, page: number, limit: number) =>
      ["reviews", bookId, "list", { page, limit }] as const,
    /** The signed-in user's own review, fetched independently of pagination. */
    mine: (bookId: string, userId: string | undefined) =>
      ["reviews", bookId, "mine", userId] as const,
  },

  tickets: {
    all: ["tickets"] as const,
    list: (page: number, limit: number) =>
      ["tickets", "list", { page, limit }] as const,
  },

  payments: {
    all: ["payments"] as const,
    history: (filters: unknown) => ["payments", "history", filters] as const,
    plans: () => ["payments", "plans"] as const,
  },

  dashboard: {
    metrics: () => ["dashboard", "metrics"] as const,
  },
} as const;
