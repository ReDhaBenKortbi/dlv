import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Star, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChargilyCheckout } from "../../hooks/payments/useChargilyCheckout";
import { usePlanPricing } from "../../hooks/payments/usePlanPricing";
import { BackButton } from "../../components/common/BackButton";
import type { SubscriptionPlan } from "../../constants/subscriptionPlans";
import { cancelPendingPayment } from "../../services/paymentService";
import { notify } from "../../utils/toast";

// If a checkout has been PENDING longer than this, treat it as stale (the
// webhook likely never arrived — user abandoned checkout, network issue,
// etc.) and offer a way out instead of leaving the card stuck forever.
const STALE_PENDING_MS = 3 * 60 * 1000;

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  FREE: ["Access to all free books", "Basic library browsing", "Book ratings & reviews"],
  PRO: ["Everything in Free", "Access to all Pro books", "Priority support"],
  GOLD: ["Everything in Pro", "Access to all Gold books", "Exclusive content"],
};

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  FREE: <Lock className="w-5 h-5" />,
  PRO: <Zap className="w-5 h-5" />,
  GOLD: <Star className="w-5 h-5" />,
};

const PLAN_STYLES: Record<SubscriptionPlan, { card: string; badge: string; btn: string }> = {
  FREE: { card: "border-base-300", badge: "badge-neutral", btn: "btn-neutral" },
  PRO: { card: "border-secondary", badge: "badge-secondary", btn: "btn-secondary" },
  GOLD: { card: "border-warning", badge: "badge-warning", btn: "btn-warning" },
};

// Higher rank = more valuable plan; mirrors the backend's upgrade detection
// in chargily.service.ts so the price shown here matches what gets charged.
const PLAN_RANK: Record<SubscriptionPlan, number> = { FREE: 0, PRO: 1, GOLD: 2 };

const Subscription = () => {
  const { subscriptionStatus, isSubscribed, subscriptionPlan, subscriptionUpdatedAt, refreshUser } = useAuth();
  const { startCheckout, loading: chargilyLoading } = useChargilyCheckout();
  const { plans } = usePlanPricing();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const isEffectivelySubscribed = isSubscribed && subscriptionStatus === "APPROVED";
  const isWaiting = subscriptionStatus === "PENDING";
  // A user on an active paid plan with room to go higher (PRO -> GOLD today)
  // gets an upgrade flow instead of the "already subscribed" dead end.
  const isUpgradeEligible = isEffectivelySubscribed && PLAN_RANK[subscriptionPlan] < PLAN_RANK.GOLD;

  const [isStalePending, setIsStalePending] = useState(false);

  useEffect(() => {
    if (!isWaiting || !subscriptionUpdatedAt) return;
    const pendingSince = new Date(subscriptionUpdatedAt).getTime();
    const interval = setInterval(() => {
      setIsStalePending(Date.now() - pendingSince > STALE_PENDING_MS);
    }, 5000);
    return () => clearInterval(interval);
  }, [isWaiting, subscriptionUpdatedAt]);

  const handleCancelPending = async () => {
    setCancelling(true);
    try {
      await cancelPendingPayment();
      await refreshUser();
    } catch {
      notify.error("Couldn't cancel the pending payment. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if ((isEffectivelySubscribed && !isUpgradeEligible) || isWaiting) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl text-center p-10">
          <div className={`badge ${isWaiting ? "badge-warning" : "badge-success"} mb-4`}>
            {isWaiting ? "Processing" : "Active"}
          </div>
          <h2 className="text-2xl font-bold">
            {isWaiting ? "Payment Processing" : "Subscription Active"}
          </h2>
          <p className="text-base-content/70 mt-2">
            {isWaiting
              ? "Your payment is being confirmed. This usually takes a few minutes."
              : "You already have access to your plan's books!"}
          </p>
          {isStalePending && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-base-content/60">
                Still stuck? The payment may not have gone through.
              </p>
              <button
                className={`btn btn-outline btn-warning btn-sm w-full ${cancelling ? "loading" : ""}`}
                disabled={cancelling}
                onClick={() => void handleCancelPending()}
              >
                Cancel & Try Again
              </button>
            </div>
          )}
          <Link to="/" className="btn btn-primary mt-8">
            Return to Library
          </Link>
        </div>
      </div>
    );
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
  const payablePrice = selectedPlan
    ? plans[selectedPlan].price -
      (isUpgradeEligible ? plans[subscriptionPlan].price : 0)
    : 0;

  return (
    <div className="min-h-screen bg-base-200 pb-16 px-4">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <BackButton className="mb-2" />
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            {isUpgradeEligible ? "Upgrade Your Plan" : "Choose Your Plan"}
          </h1>
          <p className="text-sm opacity-60">
            {isUpgradeEligible
              ? `You're on ${plans[subscriptionPlan].label} — upgrade to unlock more, you'll only pay the difference`
              : "Unlock more books by upgrading your subscription"}
          </p>
        </header>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planKeys.map((key) => {
            const plan = plans[key];
            const styles = PLAN_STYLES[key];
            const isSelected = selectedPlan === key;
            const isFree = key === "FREE";
            const isCurrentPlan = isUpgradeEligible && key === subscriptionPlan;
            const isUpgradeTarget = isUpgradeEligible && PLAN_RANK[key] > PLAN_RANK[subscriptionPlan];
            const isDisabled = isFree || isCurrentPlan;

            return (
              <div
                key={key}
                onClick={() => !isDisabled && setSelectedPlan(key)}
                className={`card bg-base-100 border-2 shadow-md rounded-2xl transition-all duration-200 ${styles.card} ${
                  isSelected ? "ring-2 ring-offset-2 ring-primary shadow-xl scale-[1.02]" : ""
                } ${!isDisabled ? "cursor-pointer hover:shadow-lg" : "opacity-70"}`}
              >
                <div className="card-body p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`badge ${styles.badge} gap-1`}>
                      {PLAN_ICONS[key]}
                      {plan.label}
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                  </div>

                  <div>
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold">Free</span>
                    ) : isUpgradeTarget ? (
                      <span className="text-2xl font-bold">
                        {plan.price - plans[subscriptionPlan].price}{" "}
                        <span className="text-base font-normal opacity-60">DA to upgrade</span>
                      </span>
                    ) : (
                      <span className="text-2xl font-bold">
                        {plan.price} <span className="text-base font-normal opacity-60">DA / month</span>
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {PLAN_FEATURES[key].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isFree ? (
                    <div className="btn btn-neutral btn-sm w-full pointer-events-none opacity-50">
                      Current Default
                    </div>
                  ) : isCurrentPlan ? (
                    <div className="btn btn-neutral btn-sm w-full pointer-events-none opacity-50">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      className={`btn ${styles.btn} btn-sm w-full`}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan(key); }}
                    >
                      {isSelected ? "Selected" : isUpgradeTarget ? `Upgrade to ${plan.label}` : `Choose ${plan.label}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PAYMENT SECTION — only shown when a paid plan is selected */}
        {selectedPlan && selectedPlan !== "FREE" && (
          <div className="space-y-6">
            <div className="divider text-sm opacity-50">
              {isUpgradeEligible
                ? `Upgrade to ${plans[selectedPlan].label} — ${payablePrice} DA`
                : `Pay for ${plans[selectedPlan].label} — ${payablePrice} DA / month`}
            </div>

            <div className="card bg-base-100 border border-base-200 shadow-xl rounded-2xl max-w-lg mx-auto">
              <div className="card-body space-y-6">
                <div>
                  <h2 className="font-semibold text-lg">Pay with Chargily</h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    Secure online payment via CIB / EDAHABIA card. You will be redirected to the Chargily payment page.
                  </p>
                </div>

                <button
                  className={`btn btn-primary w-full font-semibold ${chargilyLoading ? "loading" : ""}`}
                  disabled={chargilyLoading}
                  onClick={() => startCheckout(selectedPlan)}
                >
                  {chargilyLoading ? "Redirecting..." : `Pay ${payablePrice} DA`}
                </button>

                <div className="bg-base-200 rounded-xl p-4 text-xs opacity-70">
                  {isUpgradeEligible
                    ? "You're only charged the difference — your subscription end date stays the same."
                    : "Your subscription is activated automatically after a successful payment."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
