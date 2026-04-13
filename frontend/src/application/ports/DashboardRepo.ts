export interface DashboardStats {
  users: number;
  books: number;
  pendingPayments: number;
}

export interface DashboardRepo {
  getMetrics(): Promise<DashboardStats>;
}
