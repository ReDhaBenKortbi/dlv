export const SUBSCRIPTION_PLANS = {
  FREE: { id: "FREE", label: "Free", price: 0 },
  PRO: { id: "PRO", label: "Pro", price: 500 },
  GOLD: { id: "GOLD", label: "Gold", price: 900 },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
