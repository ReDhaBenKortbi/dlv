// Pricing/labels are no longer hardcoded here — they're fetched at runtime
// from GET /payments/plans (see usePlanPricing) so the frontend always
// matches whatever the API will actually charge.
export const SUBSCRIPTION_PLAN_IDS = ["FREE", "PRO", "GOLD"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN_IDS)[number];
