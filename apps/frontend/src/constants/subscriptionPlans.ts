import type { IconType } from "react-icons";
import { LuLock, LuStar, LuZap } from "react-icons/lu";

// Pricing/labels are no longer hardcoded here — they're fetched at runtime
// from GET /payments/plans (see usePlanPricing) so the frontend always
// matches whatever the API will actually charge.
export const SUBSCRIPTION_PLAN_IDS = ["FREE", "PRO", "GOLD"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN_IDS)[number];

/**
 * What each plan advertises. Copy only â the price and label beside it are
 * whatever GET /payments/plans reports, never a constant here.
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  FREE: ["Access to all free books", "Sample chapters", "Basic library browsing"],
  PRO: ["Access to all Pro books", "Unlock full book content", "Annotation features"],
  GOLD: [
    "Access to all Gold books",
    "Work, Student & Teacher editions",
    "Video books included",
    "Interactive digital activities",
    "Exclusive content",
  ],
};

/** Stored as components, not elements, so this stays a plain .ts module. */
export const PLAN_ICONS: Record<SubscriptionPlan, IconType> = {
  FREE: LuLock,
  PRO: LuZap,
  GOLD: LuStar,
};

export const PLAN_STYLES: Record<
  SubscriptionPlan,
  { card: string; badge: string }
> = {
  FREE: { card: "border-base-300", badge: "badge-neutral" },
  PRO: { card: "border-secondary", badge: "badge-secondary" },
  GOLD: { card: "border-warning", badge: "badge-warning" },
};
