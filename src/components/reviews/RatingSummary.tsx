import { Star } from "lucide-react";
import type { Review } from "../../types/Review";

interface Props {
  reviews: Review[];
}

const RatingSummary = ({ reviews }: Props) => {
  if (reviews.length === 0) return null;

  // Calculate average
  const average =
    reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= Math.round(average)
                ? "fill-warning text-warning"
                : "text-base-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold">{average.toFixed(1)}</span>
      <span className="text-sm opacity-50">({reviews.length} reviews)</span>
    </div>
  );
};

export default RatingSummary;
