/** Pagination envelope returned by every list endpoint. */
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
}

/** A paginated list response: `{ data, meta }`. */
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}
