import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, type DashboardStats } from "../../services/userService";

export const useDashboardMetrics = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardMetrics"],
    queryFn: getDashboardStats,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
};
