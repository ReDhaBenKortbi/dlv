import { Link } from "react-router-dom";
import { LuChevronDown, LuChevronRight, LuGraduationCap, LuLanguages, LuTarget } from "react-icons/lu";

import { BOOK_TIERS, FOCUS_SKILLS } from "@/constants/bookOptions";
import { tierStyles } from "@/lib/tierStyles";
import { TierLadder } from "@/components/admin/TierLadder";
import type { Book } from "@/types/book";

interface BookSeriesRowProps {
  /** Every edition of one title, sorted FREE -> PRO -> GOLD. */
  editions: Book[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (edition: Book) => void;
  /** Id of the edition currently being deleted, if any. */
  deletingId?: string;
}

/**
 * One title per row, expandable into its tier editions.
 *
 * The admin table used to list every edition as its own row, so a three-tier
 * title appeared three times — often pages apart — with nothing but a badge
 * to say they were the same book. The public library has always collapsed
 * them (`groupBooksIntoSeries`); this makes the admin side agree.
 */
export const BookSeriesRow = ({
  editions,
  isExpanded,
  onToggle,
  onDelete,
  deletingId,
}: BookSeriesRowProps) => {
  // Cover, author and metadata come from the lowest tier edition, matching
  // how BookCard picks what to display for a series.
  const display = editions[0];
  const skillInfo = FOCUS_SKILLS.find((s) => s.id === display.focusSkill);
  const isSeries = editions.length > 1;

  const present = new Set(editions.map((e) => e.bookTier));
  // The lowest tier with no edition yet — what "+ Edition" should create.
  // Nothing missing means the series is complete and the action is hidden.
  const missingTier = BOOK_TIERS.find((t) => !present.has(t.id));

  const editionActions = (edition: Book) => (
    <div className="flex gap-2 justify-end">
      <Link
        to={`/admin/edit-book/${edition.id}`}
        className="btn btn-xs btn-outline btn-info"
      >
        Edit
      </Link>
      <button
        onClick={() => onDelete(edition)}
        disabled={deletingId === edition.id}
        className="btn btn-xs btn-outline btn-error"
      >
        {deletingId === edition.id ? "..." : "Delete"}
      </button>
    </div>
  );

  return (
    <>
      <tr className="hover">
        <td>
          <div className="flex items-center gap-2">
            {isSeries ? (
              <button
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse editions" : "Expand editions"}
                className="btn btn-ghost btn-xs px-1"
              >
                {isExpanded ? (
                  <LuChevronDown size={14} />
                ) : (
                  <LuChevronRight size={14} />
                )}
              </button>
            ) : (
              <span className="w-6 flex-none" />
            )}

            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img src={display.coverURL} alt={display.title} />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm leading-tight">
                {display.title}
              </span>
              <span className="text-[10px] opacity-60">
                by {display.author}
              </span>
            </div>
          </div>
        </td>

        <td>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
              <LuLanguages size={12} /> {display.targetLanguage || "N/A"}
            </div>
            {skillInfo && (
              <div
                className={`badge ${skillInfo.color} badge-xs text-[9px] border-none font-bold gap-1`}
              >
                <LuTarget size={10} />
                {skillInfo.label}
              </div>
            )}
          </div>
        </td>

        <td className="text-center">
          {display.proficiencyLevel ? (
            <div className="badge badge-ghost border-base-300 gap-1 font-bold">
              <LuGraduationCap size={12} className="opacity-60" />
              {display.proficiencyLevel}
            </div>
          ) : (
            <span className="opacity-20 text-xs">-</span>
          )}
        </td>

        <td>
          <div className="flex flex-col gap-1">
            <TierLadder present={present} />
            <span className="text-[10px] opacity-50">
              {isSeries ? `${editions.length} editions` : "standalone"}
            </span>
          </div>
        </td>

        <td className="text-right">
          <div className="flex gap-2 justify-end">
            {missingTier && (
              <Link
                to={`/admin/add-book?fromId=${display.id}&tier=${missingTier.id}`}
                className="btn btn-xs btn-outline"
                title={`Create the ${missingTier.label} edition of this title, reusing its cover image`}
              >
                + {missingTier.label}
              </Link>
            )}
            {/* A standalone title has no sub-row to hold its own actions. */}
            {!isSeries && editionActions(display)}
          </div>
        </td>
      </tr>

      {isSeries &&
        isExpanded &&
        editions.map((edition) => (
          <tr key={edition.id} className="bg-base-300/30">
            <td colSpan={4}>
              <div className="flex items-center gap-3 pl-12">
                <span
                  className={`inline-block w-16 text-center py-1 rounded-md text-[10px] font-bold uppercase flex-none ${tierStyles[edition.bookTier].bg} ${tierStyles[edition.bookTier].text}`}
                >
                  {edition.bookTier}
                </span>
                <span className="text-sm truncate">{edition.title}</span>
              </div>
            </td>
            <td className="text-right">{editionActions(edition)}</td>
          </tr>
        ))}
    </>
  );
};
