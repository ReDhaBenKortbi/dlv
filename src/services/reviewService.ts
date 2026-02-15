import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  limit,
  runTransaction, // <--- This fixes your error!
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Review, NewReviewData } from "../types/Review";

const COLLECTION_NAME = "reviews";

/**
 * Add a new review and update the Book's aggregate ratings
 */
export const addReview = async (reviewData: NewReviewData): Promise<string> => {
  const reviewsCol = collection(db, COLLECTION_NAME);
  const bookRef = doc(db, "books", reviewData.bookId);
  const newReviewRef = doc(reviewsCol);

  await runTransaction(db, async (transaction) => {
    const bookDoc = await transaction.get(bookRef);
    if (!bookDoc.exists()) throw new Error("Book not found");

    const bookData = bookDoc.data();
    const prevTotal = bookData.totalReviews || 0;
    const prevAvg = bookData.averageRating || 0;

    const newTotal = prevTotal + 1;
    const newAvg = (prevAvg * prevTotal + reviewData.rating) / newTotal;

    transaction.set(newReviewRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    transaction.update(bookRef, {
      averageRating: newAvg,
      totalReviews: newTotal,
    });
  });

  return newReviewRef.id;
};

/**
 * Fetch reviews for a specific book
 */
export const getReviewsByBookId = async (bookId: string): Promise<Review[]> => {
  const reviewsCol = collection(db, COLLECTION_NAME);
  const q = query(reviewsCol, where("bookId", "==", bookId), limit(50));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Review, "id">),
  }));
};

/**
 * Check if a user has already reviewed a book
 */
export const getUserReviewForBook = async (
  bookId: string,
  userId: string,
): Promise<Review | null> => {
  const reviewsCol = collection(db, COLLECTION_NAME);
  const q = query(
    reviewsCol,
    where("bookId", "==", bookId),
    where("userId", "==", userId),
    limit(1),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docData = snapshot.docs[0];
  return {
    id: docData.id,
    ...(docData.data() as Omit<Review, "id">),
  };
};

/**
 * Delete a review and update the Book's aggregate ratings
 */
export const deleteReview = async (reviewId: string, bookId: string) => {
  const reviewRef = doc(db, COLLECTION_NAME, reviewId);
  const bookRef = doc(db, "books", bookId);

  await runTransaction(db, async (transaction) => {
    const reviewDoc = await transaction.get(reviewRef);
    const bookDoc = await transaction.get(bookRef);

    if (!reviewDoc.exists() || !bookDoc.exists()) return;

    const reviewData = reviewDoc.data();
    const bookData = bookDoc.data();

    const prevTotal = bookData.totalReviews || 0;
    const prevAvg = bookData.averageRating || 0;
    const reviewRating = reviewData.rating;

    const newTotal = Math.max(0, prevTotal - 1);
    let newAvg = 0;

    if (newTotal > 0) {
      newAvg = (prevAvg * prevTotal - reviewRating) / newTotal;
    }

    transaction.delete(reviewRef);
    transaction.update(bookRef, {
      averageRating: newAvg,
      totalReviews: newTotal,
    });
  });
};
