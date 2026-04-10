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
export function isSubscriptionExpired(_endDate: Date, _now: Date): boolean {
  return false; // stub — tests will be RED
}

/**
 * Computes the subscription end date by adding SUBSCRIPTION_DURATION_DAYS
 * to the given start date without mutating it.
 */
export function computeSubscriptionEndDate(_startDate: Date): Date {
  return new Date(0); // stub — tests will be RED
}
