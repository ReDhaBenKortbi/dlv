import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface DashboardStats {
  users: number;
  books: number;
  pendingPayments: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const usersRef = collection(db, "users");
  const booksRef = collection(db, "books");
  const paymentsQuery = query(
    collection(db, "paymentRequests"),
    where("status", "==", "pending"),
  );

  const [usersSnap, booksSnap, paymentsSnap] = await Promise.all([
    getCountFromServer(usersRef),
    getCountFromServer(booksRef),
    getCountFromServer(paymentsQuery),
  ]);

  return {
    users: usersSnap.data().count,
    books: booksSnap.data().count,
    pendingPayments: paymentsSnap.data().count,
  };
};
