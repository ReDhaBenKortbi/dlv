/**
 * Subscription domain policy — pure functions, no Firebase, no React.
 *
 * Phase 0: stubs — return placeholder values so tests compile.
 * Phase 1: replace with real implementations (tests will go GREEN).
 */

export const SUBSCRIPTION_DURATION_DAYS = 30;

/**
 * Returns true when the subscription has expired relative to `now`.
 * Exact equality (end === now) is treated as expired.
 */
export function isSubscriptionExpired(endDate: Date, now: Date): boolean {
  return endDate <= now;
}

/**
 * Computes the subscription end date by adding SUBSCRIPTION_DURATION_DAYS
 * to the given start date without mutating it.
 */
export function computeSubscriptionEndDate(startDate: Date): Date {
  const durationMs = SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  return new Date(startDate.getTime() + durationMs);
}
