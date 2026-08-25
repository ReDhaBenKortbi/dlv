import { useState } from "react";
import { createChargilyCheckout } from "@/services/paymentService";
import { notify } from "@/lib/notify";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";

export const useChargilyCheckout = () => {
  const [loading, setLoading] = useState(false);

  const startCheckout = async (plan: SubscriptionPlan): Promise<void> => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createChargilyCheckout(plan);
      window.location.href = checkoutUrl;
    } catch {
      notify.error("Failed to start payment. Please try again.");
      setLoading(false);
    }
  };

  return { startCheckout, loading };
};
