import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { DashboardStats } from "../../services/adminService";

// Fetch stats from Firestore
const fetchDashboardMetrics = async (): Promise<DashboardStats> => {
  const usersSnap = await getCountFromServer(collection(db, "users"));
  const booksSnap = await getCountFromServer(collection(db, "books"));
  const paymentsSnap = await getCountFromServer(
    query(collection(db, "paymentRequests"), where("status", "==", "pending")),
  );

  return {
    users: usersSnap.data().count,
    books: booksSnap.data().count,
    pendingPayments: paymentsSnap.data().count,
  };
};

// Custom hook
export const useDashboardMetrics = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardMetrics"],
    queryFn: fetchDashboardMetrics,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
  });
};
