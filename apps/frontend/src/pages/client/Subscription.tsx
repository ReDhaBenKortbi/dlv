import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LuCircleCheckBig, LuZap, LuStar, LuLock } from "react-icons/lu";

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
  FREE: [
    "Access to all free books",
    "Sample chapters",
    "Basic library browsing",
  ],
  PRO: [
    "Access to all Pro books",
    "Unlock full book content",
    "Annotation features",
  ],
  GOLD: [
    "Access to all Gold books",
    "Work, Student & Teacher editions",
    "Video books included",
    "Interactive digital activities",
    "Exclusive content",
  ],
};

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  FREE: <LuLock className="w-5 h-5" />,
  PRO: <LuZap className="w-5 h-5" />,
  GOLD: <LuStar className="w-5 h-5" />,
};

const PLAN_STYLES: Record<
  SubscriptionPlan,
  { card: string; badge: string; btn: string }
> = {
  FREE: { card: "border-base-300", badge: "badge-neutral", btn: "btn-neutral" },
  PRO: {
    card: "border-secondary",
    badge: "badge-secondary",
    btn: "btn-secondary",
  },
  GOLD: { card: "border-warning", badge: "badge-warning", btn: "btn-warning" },
};

// Higher rank = more valuable plan; mirrors the backend's upgrade detection
// in chargily.service.ts so the price shown here matches what gets charged.
const PLAN_RANK: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 1,
  GOLD: 2,
};

const Subscription = () => {
  const {
    subscriptionStatus,
    isSubscribed,
    subscriptionPlan,
    subscriptionUpdatedAt,
    refreshUser,
  } = useAuth();
  const { startCheckout, loading: chargilyLoading } = useChargilyCheckout();
  const { plans } = usePlanPricing();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [cancelling, setCancelling] = useState(false);

  const isEffectivelySubscribed =
    isSubscribed && subscriptionStatus === "APPROVED";
  const isWaiting = subscriptionStatus === "PENDING";
  // A user on an active paid plan with room to go higher (PRO -> GOLD today)
  // gets an upgrade flow instead of the "already subscribed" dead end.
  const isUpgradeEligible =
    isEffectivelySubscribed && PLAN_RANK[subscriptionPlan] < PLAN_RANK.GOLD;

  const [isStalePending, setIsStalePending] = useState(false);

  // Publishes the sticky pay bar's real height so other fixed elements
  // (e.g. SupportFab) can offset above it instead of overlapping it.
  // A callback ref (not useRef + useEffect) because the bar mounts late —
  // only after `plans` finishes loading — so a mount-only effect would
  // miss it entirely.
  const payBarObserver = useRef<ResizeObserver | null>(null);
  const payBarRef = useCallback((el: HTMLDivElement | null) => {
    payBarObserver.current?.disconnect();
    if (!el) {
      document.documentElement.style.removeProperty(
        "--sticky-bottom-bar-height",
      );
      return;
    }
    const publishHeight = () => {
      document.documentElement.style.setProperty(
        "--sticky-bottom-bar-height",
        `${el.offsetHeight}px`,
      );
    };
    publishHeight();
    payBarObserver.current = new ResizeObserver(publishHeight);
    payBarObserver.current.observe(el);
  }, []);

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
          <div
            className={`badge ${isWaiting ? "badge-warning" : "badge-success"} mb-4`}
          >
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

  const canPay = selectedPlan && selectedPlan !== "FREE";

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
          {planKeys.map((key) => {
            const plan = plans[key];
            const styles = PLAN_STYLES[key];
            const isSelected = selectedPlan === key;
            const isFree = key === "FREE";
            const isCurrentPlan = isUpgradeEligible && key === subscriptionPlan;
            const isUpgradeTarget =
              isUpgradeEligible && PLAN_RANK[key] > PLAN_RANK[subscriptionPlan];
            const isDisabled = isFree || isCurrentPlan;

            return (
              <div
                key={key}
                onClick={() => !isDisabled && setSelectedPlan(key)}
                className={`card bg-base-100 border-2 shadow-md rounded-2xl transition-all duration-200 ${styles.card} ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-primary shadow-xl scale-[1.02]"
                    : ""
                } ${!isDisabled ? "cursor-pointer hover:shadow-lg" : "opacity-70"}`}
              >
                <div className="card-body p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`badge ${styles.badge} gap-1`}>
                      {PLAN_ICONS[key]}
                      {plan.label}
                    </div>
                    {isSelected && (
                      <LuCircleCheckBig className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div>
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold">Free</span>
                    ) : isUpgradeTarget ? (
                      <span className="text-2xl font-bold">
                        {plan.price - plans[subscriptionPlan].price}{" "}
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

                  <ul className="space-y-1.5">
                    {PLAN_FEATURES[key].map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
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
          })}
        </div>
      </div>

      {/* STICKY PAY BAR — always visible on screen, no scrolling required to find it */}
      <div
        ref={payBarRef}
        className="fixed bottom-0 inset-x-0 z-40 bg-base-100 border-t border-base-300 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {canPay ? (
            <>
              <div className="min-w-0">
                <p className="text-xs opacity-60 truncate">
                  {isUpgradeEligible
                    ? `Upgrade to ${plans[selectedPlan].label}`
                    : plans[selectedPlan].label}
                </p>
                <p className="text-lg font-bold text-primary leading-tight">
                  {payablePrice} DA
                  {!isUpgradeEligible && (
                    <span className="text-xs font-normal opacity-60">
                      {" "}
                      / month
                    </span>
                  )}
                </p>
              </div>
              <button
                className={`btn btn-primary font-semibold shrink-0 ${chargilyLoading ? "loading" : ""}`}
                disabled={chargilyLoading}
                onClick={() => startCheckout(selectedPlan)}
              >
                {chargilyLoading ? "Redirecting..." : `Pay ${payablePrice} DA`}
              </button>
            </>
          ) : (
            <p className="text-sm opacity-50 w-full text-center py-2">
              Select a plan above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
