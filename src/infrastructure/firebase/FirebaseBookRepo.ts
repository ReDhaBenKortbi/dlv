import {
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "./client";
import type { BookRepo, DomainBook, CreateBookInput } from "../../application/ports/BookRepo";
import { tsToDate, tsToDateOpt } from "./mappers";

const COL = "books";

function toBook(id: string, data: DocumentData): DomainBook {
  return {
    id,
    title: data.title as string,
    author: data.author as string,
    description: data.description as string,
    coverURL: data.coverURL as string,
    indexURL: data.indexURL as string,
    isPremium: data.isPremium as boolean,
    category: data.category as string | undefined,
    targetLanguage: data.targetLanguage,
    focusSkill: data.focusSkill,
    proficiencyLevel: data.proficiencyLevel,
    averageRating: data.averageRating as number | undefined,
    totalReviews: data.totalReviews as number | undefined,
    createdAt: tsToDate(data.createdAt),
    updatedAt: tsToDateOpt(data.updatedAt),
  };
}

export function makeFirebaseBookRepo(): BookRepo {
  return {
    async findAll(): Promise<DomainBook[]> {
      const col = collection(db, COL);
      const q = query(col, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => toBook(d.id, d.data()));
    },

    async findById(id: string): Promise<DomainBook | null> {
      const ref = doc(db, COL, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return toBook(snap.id, snap.data());
    },

    async create(input: CreateBookInput): Promise<string> {
      const col = collection(db, COL);
      const ref = await addDoc(col, {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },

    async update(id: string, updates: Partial<Omit<DomainBook, "id">>): Promise<void> {
      const ref = doc(db, COL, id);
      await updateDoc(ref, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    },

    async delete(id: string): Promise<void> {
      await deleteDoc(doc(db, COL, id));
    },
  };
}
