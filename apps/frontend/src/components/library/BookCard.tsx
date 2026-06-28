import { useNavigate } from "react-router-dom";
import { Star, Crown, Languages } from "lucide-react";
import type { Book } from "../../types/book";
import { FOCUS_SKILLS } from "../../constants/bookOptions"; // Import to get colors

interface BookCardProps {
  book: Book;
  isSubscribed?: boolean;
}

export const BookCard = ({ book }: BookCardProps) => {
  const navigate = useNavigate();

  const rating = book.averageRating || 0;
  const totalReviews = book.totalReviews || 0;

  // Helper to find the color for the skill badge
  const skillInfo = FOCUS_SKILLS.find((s) => s.id === book.focusSkill);

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className="group relative flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full max-w-[200px] mx-auto"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[2/3] w-full max-h-[320px] overflow-hidden rounded-xl bg-base-200 shadow-sm transition-all duration-300 group-hover:shadow-lg">
        <img
          src={book.coverURL}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* TOP LEFT: Level Badge (e.g., B1) */}
        {book.proficiencyLevel && (
          <div className="absolute top-2 left-2 badge badge-neutral border-none bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
            {book.proficiencyLevel}
          </div>
        )}

        {/* TOP RIGHT: Pro Badge */}
        {book.isPremium && (
          <div className="absolute top-2 right-2 backdrop-blur-md bg-black/40 border border-white/10 rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
            <Crown size={10} className="text-warning" />
            <span className="text-[9px] font-bold text-white uppercase">
              Pro
            </span>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="flex flex-col px-0.5">
        {/* Language & Skill Row */}
        <div className="flex items-center gap-2 mb-1">
          {book.targetLanguage && (
            <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
              <Languages size={10} /> {book.targetLanguage}
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
          {book.title}
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
      </div>
    </div>
  );
};
