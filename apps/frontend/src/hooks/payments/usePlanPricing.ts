import { useQuery } from "@tanstack/react-query";
import { getPlanPricing } from "../../services/paymentService";

export const usePlanPricing = () => {
  const query = useQuery({
    queryKey: ["plan-pricing"],
    queryFn: getPlanPricing,
    staleTime: 10 * 60 * 1000,
  });

  return {
    plans: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
