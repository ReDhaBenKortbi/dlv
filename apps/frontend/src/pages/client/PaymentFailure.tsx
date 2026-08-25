import { useEffect } from "react";
import { LuCircleX } from "react-icons/lu";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { cancelPendingPayment } from "@/services/paymentService";
import { StatusCard } from "@/components/common/StatusCard";

const PaymentFailure = () => {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // The webhook (checkout.failed/canceled/expired) also clears PENDING, but
    // it fires asynchronously and can lag behind this redirect. Resolving it
    // here too avoids leaving the user stuck on a "Payment Processing" card
    // if they land back on /subscription before the webhook arrives.
    void cancelPendingPayment().finally(() => void refreshUser());
  }, [refreshUser]);

  return (
    <StatusCard
      icon={<LuCircleX className="w-16 h-16 text-error mx-auto" />}
      title="Payment Failed"
      body="Something went wrong with your payment. You were not charged. Please try again."
      action={
        <Link to="/subscription" className="btn btn-primary w-full">
          Try Again
        </Link>
      }
    />
  );
};

export default PaymentFailure;
