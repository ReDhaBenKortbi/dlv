import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  addDoc,
  deleteDoc,
  limit,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import type { ReviewRepo, DomainReview, CreateReviewInput } from "../../application/ports/ReviewRepo";
import { tsToDate } from "./mappers";

const COL = "reviews";

function toReview(id: string, data: DocumentData): DomainReview {
  return {
    id,
    bookId: data.bookId as string,
    userId: data.userId as string,
    userName: data.userName as string,
    rating: data.rating as number,
    comment: data.comment as string,
    createdAt: tsToDate(data.createdAt),
  };
}

export function makeFirebaseReviewRepo(): ReviewRepo {
  return {
    async findByBookId(bookId: string): Promise<DomainReview[]> {
      const col = collection(db, COL);
      const q = query(col, where("bookId", "==", bookId), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => toReview(d.id, d.data()));
    },

    async findByUserAndBook(bookId: string, userId: string): Promise<DomainReview | null> {
      const col = collection(db, COL);
      const q = query(
        col,
        where("bookId", "==", bookId),
        where("userId", "==", userId),
        limit(1),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const d = snapshot.docs[0];
      return toReview(d.id, d.data());
    },

    async create(input: CreateReviewInput): Promise<string> {
      const col = collection(db, COL);
      const ref = await addDoc(col, {
        ...input,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    },

    async delete(reviewId: string): Promise<void> {
      await deleteDoc(doc(db, COL, reviewId));
    },
  };
}
