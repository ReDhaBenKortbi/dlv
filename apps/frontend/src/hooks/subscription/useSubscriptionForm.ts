// src/hooks/useSubscriptionForm.ts
import { useState } from "react";
import { uploadReceiptAndSubmit } from "../../services/paymentService";
import { notify } from "../../utils/toast";
import type { User } from "firebase/auth";

export const useSubscriptionForm = (user: User | null) => {
  const [loading, setLoading] = useState(false);

  const submitPayment = async (
    file: File,
    amount: string,
  ): Promise<boolean> => {
    // 1. Guard check
    if (!file || !user) {
      notify.error("Please select a receipt file first.");
      return false;
    }

    setLoading(true);

    try {
      // 2. Wrap the service call in notify.promise
      // We 'await' this so that the code only moves to 'return true' if it succeeds.
      await notify.promise(
        uploadReceiptAndSubmit(
          user.uid,
          user.email!,
          user.displayName || "Reader",
          file,
          amount,
        ),
        {
          loading: "Uploading receipt...",
          success: "Receipt submitted successfully!",
          error: (err: any) => {
            if (err.code === "storage/quota-exceeded")
              return "Daily upload limit reached.";
            return `Upload failed: ${err.message || "Unknown error"}`;
          },
        },
      );

      // 3. Success path
      return true;
    } catch (err) {
      // 4. Error path
      // notify.promise already showed the error toast,
      // so we just return false to let the component know it failed.
      console.error("Payment Submission Error:", err);
      return false;
    } finally {
      // 5. Always stop the loading spinner
      setLoading(false);
    }
  };

  return { submitPayment, loading };
};
