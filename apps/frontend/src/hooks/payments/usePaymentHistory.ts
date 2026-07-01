import { useQuery } from "@tanstack/react-query";
import { getPaymentHistory } from "../../services/paymentService";

export const usePaymentHistory = (filters: {
  status?: string;
  plan?: string;
}) => {
  const query = useQuery({
    queryKey: ["payment-history", filters],
    queryFn: () => getPaymentHistory(filters),
  });

  return {
    payments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
