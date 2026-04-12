import { useState } from "react";
import { Star, PenLine } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../hooks/reviews/useReviews";

interface Props {
  bookId: string;
}

const ReviewForm = ({ bookId }: Props) => {
  const { user } = useAuth();
  const { addReview, isAdding, userReview } = useReviews(bookId);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  if (userReview) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="bg-success/20 text-success p-2 rounded-full">
          <Star size={16} className="fill-current" />
        </div>
        <p className="text-sm font-medium">Review submitted. Thanks!</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    addReview({
      bookId,
      userId: user?.uid || "anonymous",
      userName: user?.displayName || "Reader",
      rating,
      comment: comment.trim(),
    });

    setComment("");
    setRating(0);
  };

  return (
    <div className="bg-base-100 border border-base-300 p-5 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <PenLine size={18} className="text-primary" />
        <h3 className="font-bold text-base">Write a Review</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compact Stars */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase opacity-50">Rating</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hover || rating);
              return (
                <button
                  key={star}
                  type="button"
                  className="transition-transform active:scale-90 outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    size={26}
                    className={`transition-all duration-200 ${
                      isActive
                        ? "fill-warning text-warning drop-shadow-[0_0_3px_rgba(250,204,21,0.4)]"
                        : "text-base-content/20 hover:text-base-content/40"
                    }`}
                    strokeWidth={isActive ? 1.5 : 1}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Streamlined Textarea */}
        <div className="relative">
          <textarea
            className="textarea textarea-bordered w-full h-24 bg-base-200/30 text-sm focus:border-primary transition-all p-3 resize-none leading-snug"
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            maxLength={500}
          />
          <span className="absolute bottom-2 right-3 text-[9px] font-mono opacity-30">
            {comment.length}/500
          </span>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-sm w-full h-10 rounded-lg font-bold shadow-md shadow-primary/10 transition-all ${
            isAdding ? "loading" : ""
          }`}
          disabled={isAdding || rating === 0}
        >
          {isAdding ? "" : "Post Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
