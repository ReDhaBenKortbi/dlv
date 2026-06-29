import { api } from "../lib/api";
import type { AuthUser } from "../context/AuthContext";

export type UserProfile = AuthUser & { createdAt: string };

export const getUsers = (): Promise<UserProfile[]> => api("/users");

export interface DashboardStats {
  users: number;
  books: number;
  pendingPayments: number;
}

export const getDashboardStats = (): Promise<DashboardStats> =>
  api("/users/stats");

export const updateUserSubscription = (payload: { userId: string; isSubscribed: boolean }) =>
  api(`/users/${payload.userId}/subscription`, {
    method: "PATCH",
    body: JSON.stringify({ isSubscribed: payload.isSubscribed }),
  });
