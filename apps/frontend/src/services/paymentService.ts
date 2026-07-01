import { api } from "../lib/api";

export const createChargilyCheckout = (
  plan: string,
): Promise<{ checkoutUrl: string }> =>
  api("/payments/chargily/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });

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

export const getPaymentHistory = (params?: {
  status?: string;
  plan?: string;
}): Promise<PaymentHistoryItem[]> => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.plan) query.set("plan", params.plan);
  const qs = query.toString();
  return api(`/payments/history${qs ? `?${qs}` : ""}`);
};
