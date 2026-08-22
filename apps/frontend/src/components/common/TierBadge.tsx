import { LuCrown, LuShield } from "react-icons/lu";

import type { SubscriptionPlan } from "../../constants/subscriptionPlans";

interface TierBadgeProps {
  plan: SubscriptionPlan;
  size?: "sm" | "md";
}

export const TierBadge = ({ plan, size = "md" }: TierBadgeProps) => {
  if (plan === "FREE") return null;

  const iconSize = size === "sm" ? 10 : 12;
  const textClass = size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1";

  if (plan === "GOLD") {
    return (
      <span className={`inline-flex items-center gap-1 ${textClass} rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold uppercase`}>
        <LuCrown size={iconSize} />
        Gold
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${textClass} rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-bold uppercase`}>
      <LuShield size={iconSize} />
      Pro
    </span>
  );
};
