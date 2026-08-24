import { useQuery } from "@tanstack/react-query";
import { getPlanPricing } from "../../services/paymentService";
import { queryKeys } from "../../lib/queryKeys";

export const usePlanPricing = () => {
  const query = useQuery({
    queryKey: queryKeys.payments.plans(),
    queryFn: getPlanPricing,
    staleTime: 10 * 60 * 1000,
  });

  return {
    plans: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
