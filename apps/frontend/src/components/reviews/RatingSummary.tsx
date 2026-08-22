import { LuStar } from "react-icons/lu";

interface Props {
  averageRating: number;
  totalReviews: number;
}

// Reads the book's maintained aggregate fields rather than the (paginated)
// reviews list, so the summary is always correct regardless of which page
// of reviews happens to be loaded.
const RatingSummary = ({ averageRating, totalReviews }: Props) => {
  if (totalReviews === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <LuStar
            key={star}
            size={16}
            className={`${
              star <= Math.round(averageRating)
                ? "fill-warning text-warning"
                : "text-base-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold">{averageRating.toFixed(1)}</span>
      <span className="text-sm opacity-50">({totalReviews} reviews)</span>
    </div>
  );
};

export default RatingSummary;
