import { BOOK_TIERS } from "@/constants/bookOptions";
import type { BookTier } from "@/constants/bookOptions";

/**
 * The visual vocabulary for a tier, in one place.
 *
 * Replaces the tier ternary that had been inlined at 8+ call sites
 * (BookDetails, BooksManager, BookPreview, Navbar, Profile, EditBook,
 * UsersManager), each with slightly different colours for the same tier.
 *
 * `label` and `badge` are derived from `BOOK_TIERS` in constants/bookOptions
 * rather than restated, so there is still exactly one tier list.
 */
export interface TierStyle {
  /** Human-readable name, e.g. "Gold". */
  label: string;
  /** daisyUI badge modifier, e.g. "badge-warning". */
  badge: string;
  /** Foreground colour for tier-tinted text. */
  text: string;
  /** Tinted surface background, pairs with `border`. */
  bg: string;
  /** Border to pair with `bg`. */
  border: string;
  /** Solid fill plus a readable foreground — for avatars and filled chips. */
  solid: string;
  /** Ring colour for avatar/selection outlines. */
  ring: string;
}

/**
 * The tint set. Kept as complete literal class strings (never interpolated)
 * so Tailwind's scanner can see them.
 */
const TIER_TINTS: Record<BookTier, Omit<TierStyle, "label" | "badge">> = {
  FREE: {
    text: "text-primary",
    bg: "bg-primary/15",
    border: "border-primary/20",
    solid: "bg-primary text-primary-content",
    ring: "ring-base-100",
  },
  PRO: {
    text: "text-secondary",
    bg: "bg-secondary/15",
    border: "border-secondary/20",
    solid: "bg-secondary text-secondary-content",
    ring: "ring-secondary/60",
  },
  GOLD: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/20",
    solid: "bg-amber-500 text-white",
    ring: "ring-amber-400",
  },
};

export const tierStyles: Record<BookTier, TierStyle> = Object.fromEntries(
  BOOK_TIERS.map((tier) => [
    tier.id,
    { label: tier.label, badge: tier.color, ...TIER_TINTS[tier.id] },
  ]),
) as Record<BookTier, TierStyle>;

/** Highest tier wins. Shared by series sorting and subscription upgrade checks. */
export const TIER_RANK: Record<BookTier, number> = { FREE: 0, PRO: 1, GOLD: 2 };
