import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBooks } from "@/services/bookService";
import { queryKeys } from "@/lib/queryKeys";
import { groupBooksIntoSeries } from "@/lib/bookSeries";
import type { Book } from "@/types/book";

const RELATED_FETCH_LIMIT = 12;
const RELATED_SERIES_COUNT = 4;

/**
 * Recommendations for a book: other titles sharing its target language,
 * already collapsed into series so a 3-tier title takes one card, not three.
 *
 * The API filters by language now. The previous implementation scanned the
 * default 20-item list client-side, so recommendations were drawn only from
 * the newest titles regardless of what was being viewed.
 */
export const useRelatedBooks = (book: Book | undefined) => {
  const targetLanguage = book?.targetLanguage;

  const query = useQuery({
    queryKey: queryKeys.books.related(targetLanguage),
    queryFn: () => getBooks({ targetLanguage, limit: RELATED_FETCH_LIMIT }),
    enabled: !!targetLanguage,
  });

  const relatedSeries = useMemo(() => {
    const fetched = query.data?.data;
    if (!book || !fetched) return [];

    // Exclude the whole series being viewed, not just the one edition — a
    // sibling tier of the current title is not a recommendation.
    const currentSeriesKey = book.groupKey || book.id;
    const candidates = fetched.filter(
      (b) => (b.groupKey || b.id) !== currentSeriesKey,
    );

    return groupBooksIntoSeries(candidates).slice(0, RELATED_SERIES_COUNT);
  }, [book, query.data]);

  return { relatedSeries, isLoading: query.isLoading };
};
