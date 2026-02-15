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
import { db } from "../config/firebase";
import type { Book } from "../types/book";

const COLLECTION_NAME = "books";

/**
 * Get all books, ordered by newest first
 */
export const getBooks = async (): Promise<Book[]> => {
  const booksCol = collection(db, COLLECTION_NAME);
  const q = query(booksCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Book, "id">),
  }));
};

/**
 * Fetch a single book by ID
 */
export const getBookById = async (id: string): Promise<Book> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Book not found");
  }

  return { id: docSnap.id, ...(docSnap.data() as Omit<Book, "id">) };
};

/**
 * Create a new book
 */
export const createBook = async (newBook: Omit<Book, "id" | "createdAt">) => {
  const booksCol = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(booksCol, {
    ...newBook,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), // Track both for better history
  });
  return docRef.id;
};

/**
 * Update an existing book
 * This replaces the logic spread across multiple local hooks
 */
export const updateBook = async (id: string, updates: Partial<Book>) => {
  const bookRef = doc(db, COLLECTION_NAME, id);

  // We remove 'id' from the update payload to prevent Firestore errors
  const { id: _, ...dataToUpdate } = updates;

  await updateDoc(bookRef, {
    ...dataToUpdate,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a book
 */
export const deleteBook = async (bookId: string) => {
  const bookRef = doc(db, COLLECTION_NAME, bookId);
  await deleteDoc(bookRef);
};
