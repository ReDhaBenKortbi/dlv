import { Languages, GraduationCap, Target } from "lucide-react";
import { FOCUS_SKILLS, TARGET_LANGUAGES } from "../../constants/bookOptions";

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../../components/common/LoadingScreen";
import { BookCard } from "../../components/library/BookCard";
import { useBooks } from "../../hooks/books/useBooks";

// review imports
import ReviewList from "../../components/reviews/ReviewList";
import ReviewForm from "../../components/reviews/ReviewForm";
import { useReviews } from "../../hooks/reviews/useReviews";
import RatingSummary from "../../components/reviews/RatingSummary";
import { BackButton } from "../../components/common/BackButton";

const BookDetails = () => {
  const { id } = useParams();
  const { reviews } = useReviews(id!);
  const navigate = useNavigate();
  const { isSubscribed, isAdmin } = useAuth();

  // STEP 1: Fetch the main book data
  const { book, isLoading, isError } = useBooks(id);

  // STEP 2: Fetch related books based on the category of the book above
  // Our new useBooks hook is smart enough to wait if category is undefined
  const { relatedBooks } = useBooks(id, book);

  // STEP 3: Guard clause (This stops TypeScript from complaining)
  if (isLoading) return <LoadingScreen />;

  // If we reach this point and there's no book, show the 404 state
  if (isError || !book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium opacity-50">Book not found.</p>
        <button onClick={() => navigate("/")} className="btn btn-outline">
          Return Home
        </button>
      </div>
    );
  }

  // STEP 4: Logic is now safe. 'book' is guaranteed to exist below this line.
  const hasAccess = !book.isPremium || isSubscribed || isAdmin;

  // Find the readable labels and colors
  const skillInfo = FOCUS_SKILLS.find((s) => s.id === book.focusSkill);
  const langInfo = TARGET_LANGUAGES.find((l) => l.id === book.targetLanguage);

  return (
    <div className="min-h-screen bg-base-200 pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <BackButton /> {/* Using defaults: "Back" and navigate(-1) */}
      </div>
      {/* MAIN SECTION */}
      <div className="max-w-6xl mx-auto px-4 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* LEFT — COVER */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative">
              {book.isPremium && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="badge badge-secondary font-bold uppercase tracking-wider text-[10px] px-3 py-3">
                    Premium
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
            {/* ACADEMIC METADATA BAR */}
            <div className="flex flex-wrap gap-3">
              {/* Language Badge */}
              {langInfo && (
                <div className="badge badge-outline gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider">
                  <Languages size={14} className="text-primary" />
                  {langInfo.label}
                </div>
              )}

              {/* Level Badge */}
              {book.proficiencyLevel && (
                <div className="badge badge-neutral gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider">
                  <GraduationCap size={14} />
                  Level {book.proficiencyLevel}
                </div>
              )}

              {/* Skill Badge */}
              {skillInfo && (
                <div
                  className={`badge ${skillInfo.color} border-none gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider`}
                >
                  <Target size={14} />
                  {skillInfo.label}
                </div>
              )}
            </div>

            {/* TITLE */}
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              {book.title}
            </h1>

            {/* ADD THIS LINE HERE */}
            <RatingSummary reviews={reviews} />

            {/* AUTHOR */}
            <p className="text-lg text-primary font-semibold">
              by {book.author}
            </p>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/40">
                About this book
              </h3>

              <p className="text-base-content/70 leading-relaxed whitespace-pre-line">
                {book.description ||
                  "In a world where every page holds a new adventure, this title awaits your discovery."}
              </p>
            </div>

            {/* ACTION AREA */}
            <div className="pt-8 border-t border-base-300">
              {hasAccess ? (
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
              ) : (
                <div className="rounded-2xl bg-base-300 p-8 border border-base-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <h4 className="text-lg font-bold">
                      Premium Access Required
                    </h4>
                    <p className="text-sm text-base-content/60 mt-1 max-w-md">
                      Unlock this book and 100+ premium titles by upgrading your
                      plan.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/subscription")}
                    className="btn btn-primary px-8"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-5xl xl:max-w-6xl mx-auto mt-20 px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Reader Reviews</h2>
          <p className="text-sm opacity-60">
            See what readers think about this book
          </p>
        </div>

        {/* Form always on top */}
        <div className="mb-10">
          <ReviewForm bookId={book.id} />
        </div>

        {/* Reviews */}
        <ReviewList bookId={book.id} />
      </div>

      {/* RECOMMENDATIONS */}
      <div className="max-w-6xl mx-auto mt-24 px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-bold">More Like This</h3>
            <p className="text-sm text-base-content/50 mt-1">
              Explore similar titles
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost btn-sm"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedBooks.length > 0 ? (
            relatedBooks.map((relBook) => (
              <BookCard
                key={relBook.id}
                book={relBook}
                isSubscribed={isSubscribed}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-base-content/40 italic">
              No related books found. Try exploring the library for more
              options!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
