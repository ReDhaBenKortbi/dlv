import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const POLL_INTERVAL = 3000;
const POLL_MAX = 10;

const PaymentSuccess = () => {
  const { subscriptionStatus, refreshUser } = useAuth();
  const [polls, setPolls] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isApproved = subscriptionStatus === "APPROVED";
  const timedOut = polls >= POLL_MAX && !isApproved;

  useEffect(() => {
    void refreshUser();
    timerRef.current = setInterval(() => {
      setPolls((p) => p + 1);
      void refreshUser();
    }, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [refreshUser]);

  useEffect(() => {
    if (isApproved || timedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isApproved, timedOut]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl text-center p-10 space-y-4">
        {isApproved ? (
          <>
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold">Subscription Activated!</h2>
            <p className="text-base-content/70">Your plan is now active. Enjoy your books.</p>
          </>
        ) : timedOut ? (
          <>
            <CheckCircle className="w-16 h-16 text-warning mx-auto" />
            <h2 className="text-2xl font-bold">Payment Received</h2>
            <p className="text-base-content/70">
              Your payment was processed. Activation may take a few moments — check back shortly.
            </p>
          </>
        ) : (
          <>
            <Loader className="w-16 h-16 text-primary mx-auto animate-spin" />
            <h2 className="text-2xl font-bold">Activating Subscription…</h2>
            <p className="text-base-content/70">Please wait while we confirm your payment.</p>
          </>
        )}
        <Link to="/" className="btn btn-primary w-full mt-4">
          Return to Library
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
