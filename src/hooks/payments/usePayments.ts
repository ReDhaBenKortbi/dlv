import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingPayments,
  processPayment,
} from "../../services/paymentService";
import type { PaymentRequest } from "../../types/paymentRequest";
import { notify } from "../../utils/toast"; // Import your adapter

export const usePayments = () => {
  const queryClient = useQueryClient();

  // 1. Fetching Logic
  const {
    data: requests = [],
    isLoading,
    isError,
  } = useQuery<PaymentRequest[]>({
    queryKey: ["pendingPayments"],
    queryFn: getPendingPayments,
  });

  // 2. Mutation Logic
  const mutation = useMutation({
    mutationFn: ({
      request,
      status,
    }: {
      request: PaymentRequest;
      status: "approved" | "rejected";
    }) => processPayment(request, status),

    onSuccess: () => {
      // Refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
    },
    // We handle the Error UI inside the handleAction promise wrapper below
  });

  return {
    requests,
    isLoading,
    isError,

    /**
     * PRO IMPLEMENTATION:
     * We wrap the mutation in our notify.promise.
     * This handles the Loading, Success, and Error toasts in one go.
     */
    handleAction: async (
      request: PaymentRequest,
      status: "approved" | "rejected",
    ) => {
      const actionText = status === "approved" ? "approving" : "rejecting";
      const successText =
        status === "approved" ? "Subscription activated!" : "Request rejected.";

      await notify.promise(
        mutation.mutateAsync({ request, status }), // Use mutateAsync to return the promise
        {
          loading: `Processing payment: ${actionText}...`,
          success: `${request.userEmail}: ${successText}`,
          error: (err: any) =>
            `Action failed: ${err.message || "Unknown error"}`,
        },
      );
    },

    isProcessing: mutation.isPending,
  };
};
