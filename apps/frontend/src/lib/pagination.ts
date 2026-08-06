export const getTotalPages = (total: number, limit: number): number =>
  limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
