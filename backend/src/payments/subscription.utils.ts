/** Reused from frontend domain/subscription/policy.ts */

const SUBSCRIPTION_DURATION_DAYS = 30;

export function computeSubscriptionEndDate(startDate: Date): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + SUBSCRIPTION_DURATION_DAYS);
  return end;
}
