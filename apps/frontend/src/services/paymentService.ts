import { api } from "@/lib/api";
import { buildQuery } from "@/lib/qs";
import type { Paginated } from "@/types/pagination";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";

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

export interface PaymentHistoryQuery {
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}

export const getPaymentHistory = (
  params: PaymentHistoryQuery = {},
): Promise<Paginated<PaymentHistoryItem>> =>
  api(`/payments/history${buildQuery(params)}`);
