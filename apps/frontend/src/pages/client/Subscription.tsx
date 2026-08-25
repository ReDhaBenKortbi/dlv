import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useChargilyCheckout } from "@/hooks/payments/useChargilyCheckout";
import { usePlanPricing } from "@/hooks/payments/usePlanPricing";
import { BackButton } from "@/components/common/BackButton";
import { PlanCard } from "@/components/subscription/PlanCard";
import { StickyPayBar } from "@/components/subscription/StickyPayBar";
import { SubscriptionStatusCard } from "@/components/subscription/SubscriptionStatusCard";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { TIER_RANK } from "@/lib/tierStyles";

const Subscription = () => {
  const { subscriptionStatus, isSubscribed, subscriptionPlan } = useAuth();
  const { startCheckout, loading: chargilyLoading } = useChargilyCheckout();
  const { plans } = usePlanPricing();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const isEffectivelySubscribed =
    isSubscribed && subscriptionStatus === "APPROVED";
  const isWaiting = subscriptionStatus === "PENDING";
  // A user on an active paid plan with room to go higher (PRO -> GOLD today)
  // gets an upgrade flow instead of the "already subscribed" dead end.
  // TIER_RANK mirrors the backend's upgrade detection in chargily.service.ts,
  // so the price shown here matches what actually gets charged.
  const isUpgradeEligible =
    isEffectivelySubscribed && TIER_RANK[subscriptionPlan] < TIER_RANK.GOLD;

  if ((isEffectivelySubscribed && !isUpgradeEligible) || isWaiting) {
    return <SubscriptionStatusCard isWaiting={isWaiting} />;
  }

  if (!plans) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const planKeys = Object.keys(plans) as SubscriptionPlan[];

  // While upgrading, the price owed is only the difference vs. the plan
  // already paid for — matches the backend's isUpgrade pricing so what's
  // shown here is exactly what gets charged.
  const upgradeCredit = isUpgradeEligible ? plans[subscriptionPlan].price : 0;
  const payablePrice = selectedPlan
    ? plans[selectedPlan].price - upgradeCredit
    : 0;

  const canPay = selectedPlan !== null && selectedPlan !== "FREE";

  return (
    <div className="min-h-screen bg-base-200 px-4 pb-28">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <BackButton className="mb-2" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {isUpgradeEligible ? "Upgrade Your Plan" : "Choose Your Plan"}
          </h1>
          <p className="text-sm opacity-60">
            {isUpgradeEligible
              ? `You're on ${plans[subscriptionPlan].label} — upgrade to unlock more, you'll only pay the difference`
              : "Unlock more books by upgrading your subscription"}
          </p>
        </header>

        {/* PLAN CARDS — click a card to select it, no separate action button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planKeys.map((key) => (
            <PlanCard
              key={key}
              planKey={key}
              plan={plans[key]}
              upgradePrice={
                isUpgradeEligible && TIER_RANK[key] > TIER_RANK[subscriptionPlan]
                  ? plans[key].price - upgradeCredit
                  : undefined
              }
              isSelected={selectedPlan === key}
              isCurrentPlan={isUpgradeEligible && key === subscriptionPlan}
              onSelect={() => setSelectedPlan(key)}
            />
          ))}
        </div>
      </div>

      <StickyPayBar
        selection={
          canPay
            ? {
                label: isUpgradeEligible
                  ? `Upgrade to ${plans[selectedPlan].label}`
                  : plans[selectedPlan].label,
                price: payablePrice,
                recurring: !isUpgradeEligible,
              }
            : null
        }
        loading={chargilyLoading}
        onPay={() => canPay && startCheckout(selectedPlan)}
      />
    </div>
  );
};

export default Subscription;
