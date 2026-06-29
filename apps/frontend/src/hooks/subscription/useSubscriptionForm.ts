import { useState } from "react";
import { uploadReceiptAndSubmit } from "../../services/paymentService";
import { notify } from "../../utils/toast";
import type { AuthUser } from "../../context/AuthContext";

export const useSubscriptionForm = (user: AuthUser | null) => {
  const [loading, setLoading] = useState(false);

  const submitPayment = async (
    file: File,
    amount: string,
  ): Promise<boolean> => {
    if (!file || !user) {
      notify.error("Please select a receipt file first.");
      return false;
    }

    setLoading(true);

    try {
      await notify.promise(
        uploadReceiptAndSubmit(user.email, file, amount),
        {
          loading: "Uploading receipt...",
          success: "Receipt submitted successfully!",
          error: (err: unknown) => {
            const message = err instanceof Error ? err.message : "Unknown error";
            return `Upload failed: ${message}`;
          },
        },
      );

      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitPayment, loading };
};
