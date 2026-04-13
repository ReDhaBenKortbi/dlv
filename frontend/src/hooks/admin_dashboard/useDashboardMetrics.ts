import { useQuery } from "@tanstack/react-query";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import type { DashboardStats } from "../../application/ports/DashboardRepo";

export type { DashboardStats };

export const useDashboardMetrics = () => {
  const { getDashboardMetrics } = useUseCases();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardMetrics"],
    queryFn: getDashboardMetrics,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
  });
};
