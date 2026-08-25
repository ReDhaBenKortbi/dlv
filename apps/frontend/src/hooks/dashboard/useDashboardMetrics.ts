import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, type DashboardStats } from "@/services/userService";
import { queryKeys } from "@/lib/queryKeys";

export const useDashboardMetrics = () => {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.metrics(),
    queryFn: getDashboardStats,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
};
