import { useNavigate } from "react-router-dom";
import { LuCircleCheckBig } from "react-icons/lu";

import { useAuth } from "@/context/AuthContext";
import { TierBadge } from "@/components/common/TierBadge";
import { tierStyles } from "@/lib/tierStyles";
import type { Book } from "@/types/book";

interface AccessCtaProps {
  book: Book;
  /** Whether this reader is entitled to `book` — computed once by the page. */
  hasAccess: boolean;
}

/**
 * The single-edition call to action: either open the reader, or explain what
 * upgrading would unlock. Titles that exist at several tiers get the
 * EditionLadder instead.
 */
export const AccessCta = ({ book, hasAccess }: AccessCtaProps) => {
  const navigate = useNavigate();
  const { subscriptionPlan, isAdmin } = useAuth();
  const tier = tierStyles[book.bookTier];

  if (hasAccess) {
    return (
      <div className="flex flex-col gap-4">
        {book.bookTier !== "FREE" && !isAdmin && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <LuCircleCheckBig size={16} />
            <span>Included in your</span>
            <TierBadge plan={subscriptionPlan} size="sm" />
            <span>plan</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/reader/${book.id}`)}
            className="btn btn-primary btn-lg px-10 shadow-md"
          >
            📖 Start Reading
          </button>

          <button
            onClick={() => navigate("/")}
            className="btn btn-outline btn-lg"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-8 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 ${tier.bg} ${tier.border}`}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-lg font-bold">{tier.label} Access Required</h4>
          <TierBadge plan={book.bookTier} size="sm" />
        </div>
        <p className="text-sm text-base-content/60 max-w-md">
          Unlock this book and 100+ premium titles by upgrading your plan.
        </p>
      </div>

      <button
        onClick={() => navigate("/subscription")}
        className={`btn px-8 ${
          book.bookTier === "GOLD"
            ? "bg-amber-500 hover:bg-amber-600 text-white border-none"
            : "btn-secondary"
        }`}
      >
        Upgrade Now
      </button>
    </div>
  );
};
