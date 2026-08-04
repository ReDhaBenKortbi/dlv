import { useNavigate } from "react-router-dom";
import { Star, Crown, Languages } from "lucide-react";
import type { Book } from "../../types/book";
import { FOCUS_SKILLS } from "../../constants/bookOptions";
import { useAuth } from "../../context/AuthContext";
import { getSeriesAccess } from "../../lib/bookSeries";

interface BookCardProps {
  book: Book;
  /** Sibling tier editions of the same title, including `book` itself. Defaults to `[book]` for a standalone title. */
  editions?: Book[];
}

export const BookCard = ({ book, editions }: BookCardProps) => {
  const navigate = useNavigate();
  const { subscriptionPlan, isAdmin } = useAuth();

  const seriesEditions = editions && editions.length > 0 ? editions : [book];
  // Cover/title/metadata always come from the lowest tier edition so the
  // card looks the same to every visitor; only the access line below varies.
  const display = seriesEditions[0];
  const access = getSeriesAccess(seriesEditions, subscriptionPlan, isAdmin);

  const goToTarget = () => navigate(`/book/${access.targetEdition.id}`);

  const rating = display.averageRating || 0;
  const totalReviews = display.totalReviews || 0;

  // Helper to find the color for the skill badge
  const skillInfo = FOCUS_SKILLS.find((s) => s.id === display.focusSkill);

  return (
    <div
      onClick={goToTarget}
      className="group relative flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full max-w-[200px] mx-auto"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[2/3] w-full max-h-[320px] overflow-hidden rounded-xl bg-base-200 shadow-sm transition-all duration-300 group-hover:shadow-lg">
        <img
          src={display.coverURL}
          alt={display.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* TOP LEFT: Level Badge (e.g., B1) */}
        {display.proficiencyLevel && (
          <div className="absolute top-2 left-2 badge badge-neutral border-none bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
            {display.proficiencyLevel}
          </div>
        )}

        {/* TOP RIGHT: locked-tier indicator, only when nothing in the series is accessible yet */}
        {access.status === "locked" && (
          <div className="absolute top-2 right-2 backdrop-blur-md border rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-lg bg-black/40 border-white/10">
            <Crown
              size={10}
              className={
                seriesEditions[seriesEditions.length - 1].bookTier === "GOLD"
                  ? "text-warning"
                  : "text-secondary"
              }
            />
            <span className="text-[9px] font-bold text-white uppercase">
              {seriesEditions[seriesEditions.length - 1].bookTier}
            </span>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="flex flex-col px-0.5">
        {/* Language & Skill Row */}
        <div className="flex items-center gap-2 mb-1">
          {display.targetLanguage && (
            <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
              <Languages size={10} /> {display.targetLanguage}
            </span>
          )}
          {skillInfo && (
            <div
              className={`badge ${skillInfo.color} badge-xs text-[9px] font-bold border-none`}
            >
              {skillInfo.label}
            </div>
          )}
        </div>

        <h3 className="font-bold text-sm leading-tight text-base-content group-hover:text-primary transition-colors line-clamp-1">
          {display.title}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center gap-1 mt-0.5">
          {rating > 0 ? (
            <>
              <Star size={12} className="fill-warning text-warning" />
              <span className="text-xs font-bold">{rating.toFixed(1)}</span>
              <span className="text-[10px] opacity-40">({totalReviews})</span>
            </>
          ) : (
            <span className="text-[10px] opacity-30 italic">Unrated</span>
          )}
        </div>

        {/* Personal access line + CTA */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-base-300">
          <span className={`w-1.5 h-1.5 rounded-full ${access.dotClassName}`} />
          <span className={`text-[10px] font-bold ${access.labelClassName}`}>
            {access.label}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToTarget();
          }}
          className={`mt-1.5 w-full py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
            access.status === "locked"
              ? "border border-base-300 text-base-content hover:bg-base-200"
              : access.status === "sample"
                ? "border border-primary text-primary hover:bg-primary/10"
                : "bg-primary text-primary-content hover:bg-primary/90"
          }`}
        >
          {access.ctaLabel}
        </button>
      </div>
    </div>
  );
};
