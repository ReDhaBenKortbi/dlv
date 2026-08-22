import { LuStar, LuTrash2, LuUser } from "react-icons/lu";

import type { Review } from "../../types/Review";
import { useAuth } from "../../context/AuthContext";

interface ItemProps {
  review: Review;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const ReviewItem = ({ review, onDelete, isDeleting }: ItemProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === review.userId;

  const dateString = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : "Recently";

  return (
    <div className="group relative bg-base-100 dark:bg-base-200/50 border border-base-300 dark:border-base-400/10 p-5 rounded-2xl transition-all hover:shadow-md mb-4">
      {/* Header: Avatar, Name, Stars, and Delete */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar - DaisyUI Circle */}
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
              <span className="text-sm font-bold uppercase ">
                {review.user.email.charAt(0)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm md:text-base text-base-content leading-tight">
              {review.user.email}
            </h4>
            <p className="text-[10px] md:text-xs opacity-50 font-medium uppercase tracking-wider">
              {dateString}
            </p>
          </div>
        </div>

        {/* Action Buttons (Delete) */}
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            disabled={isDeleting}
            className="btn btn-ghost btn-circle btn-xs text-error/50 hover:text-error hover:bg-error/10 transition-colors"
            title="Delete Review"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <LuTrash2 size={16} />
            )}
          </button>
        )}
      </div>

      {/* LuStar Rating Section */}
      <div className="flex gap-0.5 mt-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <LuStar
            key={s}
            size={14}
            className={`${
              s <= review.rating
                ? "fill-warning text-warning"
                : "text-base-300 dark:text-base-content/10"
            }`}
          />
        ))}
      </div>

      {/* Review Content */}
      <div className="mt-3">
        <p className="text-sm md:text-base text-base-content/80 leading-relaxed italic italic-none">
          "{review.body}"
        </p>
      </div>

      {/* Subtle Mobile Tag */}
      <div className="absolute bottom-3 right-5 opacity-0 group-hover:opacity-20 transition-opacity hidden md:block">
        <LuUser size={12} />
      </div>
    </div>
  );
};

export default ReviewItem;
