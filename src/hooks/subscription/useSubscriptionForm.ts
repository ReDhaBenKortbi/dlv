import { useState } from "react";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import { notify } from "../../utils/toast";
import type { DomainAuthUser } from "../../application/ports/AuthGateway";

export const useSubscriptionForm = (user: DomainAuthUser | null) => {
  const [loading, setLoading] = useState(false);
  const { submitPaymentReceipt } = useUseCases();

  const submitPayment = async (file: File, amount: string): Promise<boolean> => {
    if (!file || !user) {
      notify.error("Please select a receipt file first.");
      return false;
    }

    setLoading(true);

    try {
      await notify.promise(
        submitPaymentReceipt({
          userId: user.uid,
          userEmail: user.email ?? "",
          fullName: user.displayName ?? "Reader",
          receiptFile: file,
          amount,
        }),
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
