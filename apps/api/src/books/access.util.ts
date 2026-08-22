import { BookTier, SubscriptionPlan } from '@prisma/client';

/**
 * Single source of truth for tiered access control.
 * - FREE book  → everyone
 * - PRO book   → PRO or GOLD user
 * - GOLD book  → GOLD user only
 * Admins bypass this gate (checked by the caller).
 */
export function canAccess(
  bookTier: BookTier,
  userPlan: SubscriptionPlan,
): boolean {
  if (bookTier === 'FREE') return true;
  if (bookTier === 'PRO') return userPlan === 'PRO' || userPlan === 'GOLD';
  return userPlan === 'GOLD';
}
