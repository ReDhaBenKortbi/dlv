import { LuGraduationCap, LuLanguages, LuTarget } from "react-icons/lu";

import { FOCUS_SKILLS, TARGET_LANGUAGES } from "@/constants/bookOptions";
import { tierStyles } from "@/lib/tierStyles";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import type { Book } from "@/types/book";

const DESCRIPTION_FALLBACK =
  "In a world where every page holds a new adventure, this title awaits your discovery.";

interface BookHeroProps {
  book: Book;
  /** The access area under the description — edition ladder, read CTA or upgrade panel. */
  action: React.ReactNode;
}

/**
 * Cover, metadata badges, title, rating and description: everything about the
 * book that reads the same regardless of who is looking at it. The one part
 * that *does* vary by viewer arrives through `action`.
 */
export const BookHero = ({ book, action }: BookHeroProps) => {
  const skillInfo = FOCUS_SKILLS.find((s) => s.id === book.focusSkill);
  const langInfo = TARGET_LANGUAGES.find((l) => l.id === book.targetLanguage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
      {/* LEFT — COVER */}
      <div className="md:col-span-4 flex justify-center">
        <div className="relative">
          {book.bookTier !== "FREE" && (
            <div className="absolute top-3 right-3 z-10">
              <span
                className={`badge font-bold uppercase tracking-wider text-[10px] px-3 py-3 ${tierStyles[book.bookTier].badge}`}
              >
                {book.bookTier}
              </span>
            </div>
          )}

          <img
            src={book.coverURL}
            alt={book.title}
            className="rounded-2xl shadow-xl w-full max-w-[320px] object-cover aspect-[2/3] border border-base-300"
          />
        </div>
      </div>

      {/* RIGHT — CONTENT */}
      <div className="md:col-span-8 space-y-6">
        <div className="flex flex-wrap gap-3">
          {langInfo && (
            <div className="badge badge-outline gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider">
              <LuLanguages size={14} className="text-primary" />
              {langInfo.label}
            </div>
          )}

          {book.proficiencyLevel && (
            <div className="badge badge-neutral gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider">
              <LuGraduationCap size={14} />
              Level {book.proficiencyLevel}
            </div>
          )}

          {skillInfo && (
            <div
              className={`badge ${skillInfo.color} border-none gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider`}
            >
              <LuTarget size={14} />
              {skillInfo.label}
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-black leading-tight">
          {book.title}
        </h1>

        <RatingSummary
          averageRating={book.averageRating ?? 0}
          totalReviews={book.totalReviews ?? 0}
        />

        <p className="text-lg text-primary font-semibold">by {book.author}</p>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/40">
            About this book
          </h3>

          <p className="text-base-content/70 leading-relaxed whitespace-pre-line">
            {book.description || DESCRIPTION_FALLBACK}
          </p>
        </div>

        <div className="pt-8 border-t border-base-300">{action}</div>
      </div>
    </div>
  );
};
