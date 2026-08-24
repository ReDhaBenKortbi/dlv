import { api } from "../lib/api";
import { buildQuery } from "../lib/qs";
import type { Paginated } from "../types/pagination";
import type { AuthUser } from "../context/AuthContext";
import type { SubscriptionPlan } from "../constants/subscriptionPlans";

export type UserProfile = AuthUser & { createdAt: string };

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const getUsers = (query: UsersQuery = {}): Promise<Paginated<UserProfile>> =>
  api(`/users${buildQuery(query)}`);

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
