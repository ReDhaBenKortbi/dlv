import { LuCircleCheckBig } from "react-icons/lu";

import {
  PLAN_FEATURES,
  PLAN_ICONS,
  PLAN_STYLES,
} from "@/constants/subscriptionPlans";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import type { PlanPricing } from "@/services/paymentService";

interface PlanCardProps {
  planKey: SubscriptionPlan;
  /** Label and price as reported by the API, never a local constant. */
  plan: PlanPricing;
  /**
   * The difference owed to move here from the plan already paid for. Set only
   * when this card is an upgrade target, which is also what switches the
   * pricing line and the footer hint into upgrade wording.
   */
  upgradePrice?: number;
  isSelected: boolean;
  isCurrentPlan: boolean;
  onSelect: () => void;
}

/** One selectable plan. The whole card is the control — there is no button. */
export const PlanCard = ({
  planKey,
  plan,
  upgradePrice,
  isSelected,
  isCurrentPlan,
  onSelect,
}: PlanCardProps) => {
  const styles = PLAN_STYLES[planKey];
  const Icon = PLAN_ICONS[planKey];
  const isFree = planKey === "FREE";
  const isUpgradeTarget = upgradePrice !== undefined;
  const isDisabled = isFree || isCurrentPlan;

  return (
    <div
      onClick={() => !isDisabled && onSelect()}
      className={`card bg-base-100 border-2 shadow-md rounded-2xl transition-all duration-200 ${styles.card} ${
        isSelected
          ? "ring-2 ring-offset-2 ring-primary shadow-xl scale-[1.02]"
          : ""
      } ${!isDisabled ? "cursor-pointer hover:shadow-lg" : "opacity-70"}`}
    >
      <div className="card-body p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className={`badge ${styles.badge} gap-1`}>
            <Icon className="w-5 h-5" />
            {plan.label}
          </div>
          {isSelected && <LuCircleCheckBig className="w-5 h-5 text-primary" />}
        </div>

        <div>
          {plan.price === 0 ? (
            <span className="text-2xl font-bold">Free</span>
          ) : isUpgradeTarget ? (
            <span className="text-2xl font-bold">
              {upgradePrice}{" "}
              <span className="text-base font-normal opacity-60">
                DA to upgrade
              </span>
            </span>
          ) : (
            <span className="text-2xl font-bold">
              {plan.price}{" "}
              <span className="text-base font-normal opacity-60">
                DA / month
              </span>
            </span>
          )}
        </div>

        <ul className="space-y-1.5 flex-1">
          {PLAN_FEATURES[planKey].map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <LuCircleCheckBig className="w-4 h-4 text-success mt-0.5 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="text-xs font-medium text-center pt-1">
          {isFree ? (
            <span className="opacity-50">Current Default</span>
          ) : isCurrentPlan ? (
            <span className="opacity-50">Current Plan</span>
          ) : isSelected ? (
            <span className="text-primary">Selected</span>
          ) : (
            <span className="opacity-60">
              {isUpgradeTarget ? "Tap to upgrade" : "Tap to select"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
