import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import type { DomainPaymentRequest } from "../../application/ports/PaymentRepo";
import { notify } from "../../utils/toast";

export const usePayments = () => {
  const queryClient = useQueryClient();
  const { getPendingPayments, processPayment } = useUseCases();

  const {
    data: requests = [],
    isLoading,
    isError,
  } = useQuery<DomainPaymentRequest[]>({
    queryKey: ["pendingPayments"],
    queryFn: getPendingPayments,
  });

  const mutation = useMutation({
    mutationFn: ({
      request,
      status,
    }: {
      request: DomainPaymentRequest;
      status: "approved" | "rejected";
    }) =>
      processPayment({
        requestId: request.id,
        userId: request.userId,
        action: status === "approved" ? "approve" : "reject",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
    },
  });

  const handleAction = async (
    request: DomainPaymentRequest,
    status: "approved" | "rejected",
  ) => {
    const actionText = status === "approved" ? "approving" : "rejecting";
    const successText =
      status === "approved" ? "Subscription activated!" : "Request rejected.";

    await notify.promise(mutation.mutateAsync({ request, status }), {
      loading: `Processing payment: ${actionText}...`,
      success: `${request.userEmail}: ${successText}`,
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        return `Action failed: ${message}`;
      },
    });
  };

  return {
    requests,
    isLoading,
    isError,
    handleAction,
    isProcessing: mutation.isPending,
  };
};
