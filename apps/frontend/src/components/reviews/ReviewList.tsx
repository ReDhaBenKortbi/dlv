import { useState } from "react";
import { useReviews } from "../../hooks/reviews/useReviews";
import Pagination from "../common/Pagination";
import { getTotalPages } from "../../lib/pagination";
import ReviewItem from "./ReviewItem";

interface ListProps {
  bookId: string;
}

const ReviewList = ({ bookId }: ListProps) => {
  const [page, setPage] = useState(1);
  const { reviews, meta, isLoadingReviews, isDeleting, deleteReview } =
    useReviews(bookId, page);

  const totalPages = meta ? getTotalPages(meta.total, meta.limit) : 1;

  // Fall back to the last valid page if a deletion shrinks the total —
  // adjusted during render rather than via an effect.
  if (meta && page > totalPages) {
    setPage(totalPages);
  }

  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  /* ---------------- LOADING ---------------- */
  if (isLoadingReviews) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-base-300" />

            <div className="flex-1 space-y-3">
              <div className="h-3 w-32 bg-base-300 rounded" />
              <div className="h-3 w-24 bg-base-300 rounded" />
              <div className="h-3 w-full bg-base-300 rounded" />
              <div className="h-3 w-3/4 bg-base-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- EMPTY ---------------- */
  if (!sortedReviews.length) {
    return (
      <div className="p-10 text-center">
        <p className="font-medium">No reviews yet</p>
        <p className="text-sm opacity-60 mt-1">
          Be the first to share your experience.
        </p>
      </div>
    );
  }

  /* ---------------- LIST ---------------- */
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedReviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onDelete={deleteReview}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      {meta && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={meta.total}
          limit={meta.limit}
        />
      )}
    </div>
  );
};

export default ReviewList;
