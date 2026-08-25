import { BOOK_TIERS } from "@/constants/bookOptions";
import type { BookTier } from "@/constants/bookOptions";
import { tierStyles } from "@/lib/tierStyles";

interface TierLadderProps {
  /** The tiers this title already has an edition for. */
  present: Set<BookTier>;
}

/**
 * Every tier at a glance, filled where an edition exists and hollow where one
 * is missing — so a gap in a series is visible without expanding the row.
 */
export const TierLadder = ({ present }: TierLadderProps) => (
  <div className="flex items-center gap-2">
    {BOOK_TIERS.map(({ id, label }) => {
      const has = present.has(id);
      return (
        <span
          key={id}
          title={has ? `${label} edition exists` : `No ${label} edition yet`}
          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
            has ? tierStyles[id].text : "text-base-content/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              has ? "bg-current" : "border border-current"
            }`}
          />
          {label}
        </span>
      );
    })}
  </div>
);
