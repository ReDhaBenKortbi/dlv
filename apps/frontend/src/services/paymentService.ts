import { api } from "../lib/api";
import type { SubscriptionPlan } from "../constants/subscriptionPlans";

export interface PlanPricing {
  price: number;
  label: string;
}

export const getPlanPricing = (): Promise<
  Record<SubscriptionPlan, PlanPricing>
> => api("/payments/plans");

export const createChargilyCheckout = (
  plan: string,
): Promise<{ checkoutUrl: string }> =>
  api("/payments/chargily/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });

export const cancelPendingPayment = (): Promise<void> =>
  api("/payments/chargily/cancel-pending", { method: "POST" });

export interface PaymentHistoryItem {
  id: string;
  fullName: string;
  amount: string;
  paymentMethod: string;
  plan: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  user: { fullName: string; email: string };
}

export interface PaymentHistoryMeta {
  total: number;
  page: number;
  limit: number;
}

export const getPaymentHistory = (params?: {
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: PaymentHistoryItem[]; meta: PaymentHistoryMeta }> => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.plan) query.set("plan", params.plan);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return api(`/payments/history${qs ? `?${qs}` : ""}`);
};
