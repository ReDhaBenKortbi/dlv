import { SubscriptionPlan } from '@prisma/client';

// Single source of truth for tier pricing (DZD). The frontend never
// hardcodes these — it fetches them from GET /payments/plans.
export const PLAN_PRICING: Record<
  SubscriptionPlan,
  { price: number; label: string }
> = {
  FREE: { price: 0, label: 'Free' },
  PRO: { price: 1500, label: 'Pro' },
  GOLD: { price: 2000, label: 'Gold' },
};
