import { useState } from "react";
import { createChargilyCheckout } from "../../services/paymentService";
import { notify } from "../../utils/toast";

export const useChargilyCheckout = () => {
  const [loading, setLoading] = useState(false);

  const startCheckout = async (fullName: string): Promise<void> => {
    if (!fullName.trim()) {
      notify.error("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      const { checkoutUrl } = await createChargilyCheckout(fullName);
      window.location.href = checkoutUrl;
    } catch {
      notify.error("Failed to start payment. Please try again.");
      setLoading(false);
    }
  };

  return { startCheckout, loading };
};
