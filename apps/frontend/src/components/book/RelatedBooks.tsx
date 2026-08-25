import { useNavigate } from "react-router-dom";

import { BookCard } from "@/components/library/BookCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { BookSeries } from "@/lib/bookSeries";

interface RelatedBooksProps {
  /** Nearby titles, already grouped into one entry per series. */
  series: BookSeries[];
}

/** The "More Like This" grid at the foot of a book's page. */
export const RelatedBooks = ({ series }: RelatedBooksProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto mt-24 px-4">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-bold">More Like This</h3>
          <p className="text-sm text-base-content/50 mt-1">
            Explore similar titles
          </p>
        </div>

        <button onClick={() => navigate("/")} className="btn btn-ghost btn-sm">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {series.length > 0 ? (
          series.map(({ groupKey, editions }) => (
            <BookCard key={groupKey} book={editions[0]} editions={editions} />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon="books"
              title="No related books yet"
              message="Explore the library to find more titles like this one."
            />
          </div>
        )}
      </div>
    </div>
  );
};
