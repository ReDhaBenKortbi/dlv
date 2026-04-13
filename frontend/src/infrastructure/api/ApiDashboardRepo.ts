import { apiClient } from './ApiClient';
import type { DashboardRepo, DashboardStats } from '../../application/ports/DashboardRepo';

export function makeApiDashboardRepo(): DashboardRepo {
  return {
    async getMetrics(): Promise<DashboardStats> {
      return apiClient.get<DashboardStats>('/dashboard/metrics');
    },
  };
}
