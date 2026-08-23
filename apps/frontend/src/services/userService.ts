import { api } from "../lib/api";
import type { AuthUser } from "../context/AuthContext";
import type { SubscriptionPlan } from "../constants/subscriptionPlans";

export type UserProfile = AuthUser & { createdAt: string };

export interface UsersMeta {
  total: number;
  page: number;
  limit: number;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const getUsers = (
  query: UsersQuery = {},
): Promise<{ data: UserProfile[]; meta: UsersMeta }> => {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  return api(`/users${qs ? `?${qs}` : ""}`);
};

export interface DashboardStats {
  users: number;
  books: number;
  activeSubscribers: number;
}

export const getDashboardStats = (): Promise<DashboardStats> =>
  api("/users/stats");

export const updateUserSubscription = (payload: { userId: string; plan: SubscriptionPlan }) =>
  api(`/users/${payload.userId}/subscription`, {
    method: "PATCH",
    body: JSON.stringify({ plan: payload.plan }),
  });
