import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Star, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChargilyCheckout } from "../../hooks/payments/useChargilyCheckout";
import { BackButton } from "../../components/common/BackButton";
import { SUBSCRIPTION_PLANS } from "../../constants/subscriptionPlans";
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

const Subscription = () => {
  const { subscriptionStatus, isSubscribed, subscriptionUpdatedAt, refreshUser } = useAuth();
  const { startCheckout, loading: chargilyLoading } = useChargilyCheckout();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const isEffectivelySubscribed = isSubscribed && subscriptionStatus === "APPROVED";
  const isWaiting = subscriptionStatus === "PENDING";

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

  if (isEffectivelySubscribed || isWaiting) {
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

  const planKeys = Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[];

  return (
    <div className="min-h-screen bg-base-200 pb-16 px-4">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <BackButton className="mb-2" />
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Choose Your Plan</h1>
          <p className="text-sm opacity-60">Unlock more books by upgrading your subscription</p>
        </header>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planKeys.map((key) => {
            const plan = SUBSCRIPTION_PLANS[key];
            const styles = PLAN_STYLES[key];
            const isSelected = selectedPlan === key;
            const isFree = key === "FREE";

            return (
              <div
                key={key}
                onClick={() => !isFree && setSelectedPlan(key)}
                className={`card bg-base-100 border-2 shadow-md rounded-2xl transition-all duration-200 ${styles.card} ${
                  isSelected ? "ring-2 ring-offset-2 ring-primary shadow-xl scale-[1.02]" : ""
                } ${!isFree ? "cursor-pointer hover:shadow-lg" : "opacity-70"}`}
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
                  ) : (
                    <button
                      className={`btn ${styles.btn} btn-sm w-full`}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan(key); }}
                    >
                      {isSelected ? "Selected" : `Choose ${plan.label}`}
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
              Pay for {SUBSCRIPTION_PLANS[selectedPlan].label} — {SUBSCRIPTION_PLANS[selectedPlan].price} DA / month
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
                  {chargilyLoading ? "Redirecting..." : `Pay ${SUBSCRIPTION_PLANS[selectedPlan].price} DA`}
                </button>

                <div className="bg-base-200 rounded-xl p-4 text-xs opacity-70">
                  Your subscription is activated automatically after a successful payment.
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
