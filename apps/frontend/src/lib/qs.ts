/**
 * Builds a URL query string (including the leading `?`, or `""` when empty)
 * from a params object.
 *
 * Extracted from the builder that lived in `bookService.getBooks`; replaces the
 * three hand-rolled variants that had drifted across bookService, userService
 * and paymentService.
 *
 * - `undefined`, `null` and `""` are omitted, so callers can pass optional
 *   filters straight through without pre-filtering.
 * - Arrays are joined with commas, matching what the API's `BooksFilterDto`
 *   splits on. Empty arrays are omitted.
 * - Everything else is stringified.
 *
 * Takes `object` rather than `Record<string, ...>` because interfaces without
 * an index signature are not assignable to a Record, which would force a
 * `{ ...spread }` at every call site.
 */
export function buildQuery(params: object): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params) as [string, unknown][]) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(","));
    } else {
      search.set(key, String(value));
    }
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
