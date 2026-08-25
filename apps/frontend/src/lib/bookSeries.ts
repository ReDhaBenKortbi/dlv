import type { Book, BookTier } from "@/types/book";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";
import { TIER_RANK } from "@/lib/tierStyles";

export interface BookSeries {
  groupKey: string; // shared `groupKey`, or the book's own id when standalone
  editions: Book[]; // sorted FREE -> PRO -> GOLD
}

/**
 * Collapses tier editions of the same title (linked via `groupKey`) into one
 * series per title. Books without a `groupKey` are their own series of one,
 * so the grid keeps working unchanged for standalone titles.
 */
export function groupBooksIntoSeries(books: Book[]): BookSeries[] {
  const seriesByKey = new Map<string, Book[]>();
  for (const book of books) {
    const key = book.groupKey || book.id;
    const existing = seriesByKey.get(key);
    if (existing) existing.push(book);
    else seriesByKey.set(key, [book]);
  }
  return Array.from(seriesByKey.entries()).map(([groupKey, editions]) => ({
    groupKey,
    editions: [...editions].sort(
      (a, b) => TIER_RANK[a.bookTier] - TIER_RANK[b.bookTier],
    ),
  }));
}

export function canAccessTier(
  tier: BookTier,
  plan: SubscriptionPlan | undefined,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  if (tier === "FREE") return true;
  if (tier === "PRO") return plan === "PRO" || plan === "GOLD";
  return plan === "GOLD";
}

export type SeriesAccessStatus = "free" | "in-plan" | "sample" | "locked";

export interface SeriesAccess {
  status: SeriesAccessStatus;
  label: string;
  ctaLabel: string;
  dotClassName: string;
  labelClassName: string;
  /** Which edition a click through the card/CTA should open. */
  targetEdition: Book;
}

/**
 * Plan-aware "personal access line" for a series (design doc variant 1b):
 * tells the current user how *they* can read this title, not just which
 * editions exist.
 */
export function getSeriesAccess(
  editions: Book[],
  plan: SubscriptionPlan | undefined,
  isAdmin: boolean,
): SeriesAccess {
  const topEdition = editions[editions.length - 1];
  const topTierLabel = topEdition.bookTier === "GOLD" ? "Gold" : "Pro";

  if (topEdition.bookTier === "FREE") {
    return {
      status: "free",
      label: "Free to read",
      ctaLabel: "Read now",
      dotClassName: "bg-base-content/40",
      labelClassName: "text-base-content/60",
      targetEdition: topEdition,
    };
  }

  // Full access only means the *top* tier is within reach — merely being
  // able to read the free sample doesn't count (FREE is always accessible).
  if (canAccessTier(topEdition.bookTier, plan, isAdmin)) {
    return {
      status: "in-plan",
      label: isAdmin ? "Admin access" : "In your plan",
      ctaLabel: "Start reading",
      dotClassName: "bg-emerald-500",
      labelClassName: "text-emerald-600 dark:text-emerald-400",
      targetEdition: topEdition,
    };
  }

  // Best edition the user can already read, short of the top tier —
  // could be the free sample, or a paid tier below the series' ceiling
  // (e.g. a Pro subscriber looking at a Free/Pro/Gold series).
  const bestAccessible = [...editions]
    .reverse()
    .find((e) => canAccessTier(e.bookTier, plan, isAdmin));

  if (bestAccessible) {
    const isFreeSample = bestAccessible.bookTier === "FREE";
    return {
      status: "sample",
      label: isFreeSample
        ? `Sample now · full in ${topTierLabel}`
        : `${bestAccessible.bookTier === "GOLD" ? "Gold" : "Pro"} unlocked · full in ${topTierLabel}`,
      ctaLabel: isFreeSample ? "Read sample" : "Continue reading",
      dotClassName: "bg-primary",
      labelClassName: "text-primary",
      targetEdition: bestAccessible,
    };
  }

  return {
    status: "locked",
    label: "Upgrade to unlock",
    ctaLabel: "See plans",
    dotClassName: "bg-amber-500",
    labelClassName: "text-amber-600 dark:text-amber-500",
    targetEdition: editions[0],
  };
}
