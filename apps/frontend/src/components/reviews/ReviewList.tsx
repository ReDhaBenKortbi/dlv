import { useReviews } from "../../hooks/reviews/useReviews";
import ReviewItem from "./ReviewItem";

interface ListProps {
  bookId: string;
}

const ReviewList = ({ bookId }: ListProps) => {
  const { reviews, isLoadingReviews, isDeleting, deleteReview } =
    useReviews(bookId);

  // Sort locally by date (Newest First)
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA =
      a.createdAt instanceof Date
        ? a.createdAt.getTime()
        : a.createdAt.toMillis();
    const dateB =
      b.createdAt instanceof Date
        ? b.createdAt.getTime()
        : b.createdAt.toMillis();
    return dateB - dateA;
  });

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
  );
};

export default ReviewList;
