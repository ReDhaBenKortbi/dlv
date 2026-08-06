import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaymentHistory } from "../../services/paymentService";

export const usePaymentHistory = (filters: {
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}) => {
  const query = useQuery({
    queryKey: ["payment-history", filters],
    queryFn: () => getPaymentHistory(filters),
    placeholderData: keepPreviousData,
  });

  return {
    payments: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
