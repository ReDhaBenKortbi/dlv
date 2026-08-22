import { useEffect } from "react";
import { LuCircleX } from "react-icons/lu";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cancelPendingPayment } from "../../services/paymentService";

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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl text-center p-10 space-y-4">
        <LuCircleX className="w-16 h-16 text-error mx-auto" />
        <h2 className="text-2xl font-bold">Payment Failed</h2>
        <p className="text-base-content/70">
          Something went wrong with your payment. You were not charged.
          Please try again.
        </p>
        <Link to="/subscription" className="btn btn-primary w-full mt-4">
          Try Again
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailure;
