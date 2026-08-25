import { LuCrown, LuShield } from "react-icons/lu";

import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { tierStyles } from "@/lib/tierStyles";

/** FREE renders nothing, so only the paid tiers need an icon. */
const TIER_ICON = { PRO: LuShield, GOLD: LuCrown } as const;

interface TierBadgeProps {
  plan: SubscriptionPlan;
  size?: "sm" | "md";
}

export const TierBadge = ({ plan, size = "md" }: TierBadgeProps) => {
  if (plan === "FREE") return null;

  const iconSize = size === "sm" ? 10 : 12;
  const textClass =
    size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1";
  const tier = tierStyles[plan];
  const Icon = TIER_ICON[plan];

  return (
    <span
      className={`inline-flex items-center gap-1 ${textClass} rounded-full border font-bold uppercase ${tier.bg} ${tier.text} ${tier.border}`}
    >
      <Icon size={iconSize} />
      {tier.label}
    </span>
  );
};
