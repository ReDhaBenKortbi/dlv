import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { canAccessTier } from "@/lib/bookSeries";
import { tierStyles } from "@/lib/tierStyles";
import type { Book } from "@/types/book";

interface EditionLadderProps {
  /** Every tier edition of this title, lowest tier first. */
  editions: Book[];
  /** The edition being viewed, highlighted within the ladder. */
  currentId: string;
}

/**
 * The full access ladder shown when a title exists at more than one tier
 * (design doc variant 1d): every edition, whether this reader can open it,
 * and the one action that applies to each.
 */
export const EditionLadder = ({ editions, currentId }: EditionLadderProps) => {
  const navigate = useNavigate();
  const { subscriptionPlan, isAdmin } = useAuth();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/40">
        How you can read it
      </h3>

      {editions.map((edition) => {
        const accessible = canAccessTier(
          edition.bookTier,
          subscriptionPlan,
          isAdmin,
        );
        const isFree = edition.bookTier === "FREE";
        const tier = tierStyles[edition.bookTier];
        const isCurrent = edition.id === currentId;

        return (
          <div
            key={edition.id}
            className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center gap-4 ${
              isCurrent
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-base-300 bg-base-100"
            }`}
          >
            <div className="sm:w-20 flex-none">
              <span
                className={`inline-block w-full text-center py-1.5 rounded-md text-[11px] font-bold uppercase ${tier.bg} ${tier.text}`}
              >
                {isFree ? "Sample" : tier.label}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-1">
                {edition.title}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  accessible
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-base-content/50"
                }`}
              >
                {accessible
                  ? isFree
                    ? "Free · no card needed"
                    : "Included in your plan"
                  : `Upgrade to ${tier.label} to unlock`}
              </p>
            </div>

            <button
              onClick={() =>
                navigate(accessible ? `/reader/${edition.id}` : "/subscription")
              }
              className={`btn btn-sm flex-none ${
                accessible ? "btn-primary" : "btn-outline"
              }`}
            >
              {accessible ? (isFree ? "Preview" : "Start reading") : "Upgrade"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Placeholder held while the sibling editions load. Until they land we do not
 * yet know whether this title has a ladder, and guessing renders the wrong
 * CTA for a moment before swapping it out.
 */
export const EditionLadderSkeleton = () => (
  <div className="flex flex-col gap-3" aria-busy="true">
    <div className="h-4 w-40 rounded bg-base-300 animate-pulse" />
    <div className="h-20 rounded-2xl bg-base-300 animate-pulse" />
    <div className="h-20 rounded-2xl bg-base-300 animate-pulse" />
  </div>
);
