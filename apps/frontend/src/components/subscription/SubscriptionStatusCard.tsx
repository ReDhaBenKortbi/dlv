import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { cancelPendingPayment } from "@/services/paymentService";
import { notify } from "@/utils/toast";
import { StatusCard } from "@/components/common/StatusCard";

// If a checkout has been PENDING longer than this, treat it as stale (the
// webhook likely never arrived — user abandoned checkout, network issue,
// etc.) and offer a way out instead of leaving the card stuck forever.
const STALE_PENDING_MS = 3 * 60 * 1000;

interface SubscriptionStatusCardProps {
  /** Payment is still PENDING; otherwise the subscription is already active. */
  isWaiting: boolean;
}

/**
 * The dead-end state for anyone who has nothing to buy right now: either the
 * payment is still being confirmed, or they are already on the top plan.
 * Owns the stale-pending escape hatch, which is of no interest to the page.
 */
export const SubscriptionStatusCard = ({
  isWaiting,
}: SubscriptionStatusCardProps) => {
  const { subscriptionUpdatedAt, refreshUser } = useAuth();
  const [isStalePending, setIsStalePending] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  return (
    <StatusCard
      icon={
        <div
          className={`badge ${isWaiting ? "badge-warning" : "badge-success"} mx-auto`}
        >
          {isWaiting ? "Processing" : "Active"}
        </div>
      }
      title={isWaiting ? "Payment Processing" : "Subscription Active"}
      body={
        isWaiting
          ? "Your payment is being confirmed. This usually takes a few minutes."
          : "You already have access to your plan's books!"
      }
      action={
        <Link to="/" className="btn btn-primary w-full">
          Return to Library
        </Link>
      }
    >
      {isStalePending && (
        <div className="space-y-2">
          <p className="text-sm text-base-content/60">
            Still stuck? The payment may not have gone through.
          </p>
          <button
            className={`btn btn-outline btn-warning btn-sm w-full ${cancelling ? "loading" : ""}`}
            disabled={cancelling}
            onClick={() => void handleCancelPending()}
          >
            Cancel &amp; Try Again
          </button>
        </div>
      )}
    </StatusCard>
  );
};
