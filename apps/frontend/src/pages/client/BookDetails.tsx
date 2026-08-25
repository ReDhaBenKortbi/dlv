import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { BackButton } from "@/components/common/BackButton";
import { BookHero } from "@/components/book/BookHero";
import {
  EditionLadder,
  EditionLadderSkeleton,
} from "@/components/book/EditionLadder";
import { AccessCta } from "@/components/book/AccessCta";
import { RelatedBooks } from "@/components/book/RelatedBooks";
import { useBook } from "@/hooks/books/useBook";
import { useBookEditions } from "@/hooks/books/useBookEditions";
import { useRelatedBooks } from "@/hooks/books/useRelatedBooks";
import { canAccessTier } from "@/lib/bookSeries";

import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptionPlan, isAdmin } = useAuth();

  const { book, isLoading, isError } = useBook(id);

  // Both depend on `book` being loaded first (for its groupKey / language),
  // so they stay idle until it arrives.
  const { editions: groupEditions, isLoading: isLoadingEditions } =
    useBookEditions(book);
  const { relatedSeries } = useRelatedBooks(book);

  if (isLoading) return <LoadingScreen />;

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

  const hasAccess = canAccessTier(book.bookTier, subscriptionPlan, isAdmin);

  // More than one tier edition of this title exists — show the full access
  // ladder (design doc variant 1d) instead of a single tier's CTA.
  const hasEditionLadder = groupEditions.length > 1;

  return (
    <div className="min-h-screen bg-base-200 pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <BackButton /> {/* Using defaults: "Back" and navigate(-1) */}
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-16">
        <BookHero
          book={book}
          action={
            isLoadingEditions ? (
              <EditionLadderSkeleton />
            ) : hasEditionLadder ? (
              <EditionLadder editions={groupEditions} currentId={book.id} />
            ) : (
              <AccessCta book={book} hasAccess={hasAccess} />
            )
          }
        />
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-5xl xl:max-w-6xl mx-auto mt-20 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Reader Reviews</h2>
          <p className="text-sm opacity-60">
            See what readers think about this book
          </p>
        </div>

        {/* Only entitled readers can write a review */}
        <div className="mb-10">
          {hasAccess ? (
            <ReviewForm bookId={book.id} />
          ) : (
            <div className="bg-base-100 border border-base-300 rounded-xl p-5 text-center">
              <p className="text-sm opacity-70">
                Subscribe to this book to share your review.
              </p>
            </div>
          )}
        </div>

        <ReviewList bookId={book.id} />
      </div>

      <RelatedBooks series={relatedSeries} />
    </div>
  );
};

export default BookDetails;
