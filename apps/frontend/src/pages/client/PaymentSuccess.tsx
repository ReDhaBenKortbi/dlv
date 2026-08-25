import { useEffect, useRef, useState } from "react";
import { LuCircleCheckBig, LuLoader } from "react-icons/lu";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { StatusCard } from "@/components/common/StatusCard";

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (isApproved || timedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isApproved, timedOut]);

  const state = isApproved
    ? {
        icon: <LuCircleCheckBig className="w-16 h-16 text-success mx-auto" />,
        title: "Subscription Activated!",
        body: "Your plan is now active. Enjoy your books.",
      }
    : timedOut
      ? {
          icon: <LuCircleCheckBig className="w-16 h-16 text-warning mx-auto" />,
          title: "Payment Received",
          body: "Your payment was processed. Activation may take a few moments — check back shortly.",
        }
      : {
          icon: (
            <LuLoader className="w-16 h-16 text-primary mx-auto animate-spin" />
          ),
          title: "Activating Subscription…",
          body: "Please wait while we confirm your payment.",
        };

  return (
    <StatusCard
      {...state}
      action={
        <Link to="/" className="btn btn-primary w-full">
          Return to Library
        </Link>
      }
    />
  );
};

export default PaymentSuccess;
