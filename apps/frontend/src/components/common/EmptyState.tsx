import type { IconType } from "react-icons";
import {
  LuBook,
  LuSearch,
  LuMessageSquare,
  LuUsers,
  LuCreditCard,
} from "react-icons/lu";

export type EmptyStateIcon =
  | "books"
  | "search"
  | "reviews"
  | "users"
  | "payments";

const ICONS: Record<EmptyStateIcon, IconType> = {
  books: LuBook,
  search: LuSearch,
  reviews: LuMessageSquare,
  users: LuUsers,
  payments: LuCreditCard,
};

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: EmptyStateIcon;
  /** `sm` for inline contexts like a table footer; `md` (default) for full-page. */
  size?: "sm" | "md";
}

/**
 * The "nothing here yet" state, shared by every list in the app so the wording,
 * spacing and iconography stay consistent.
 *
 * Renders no border or background of its own — callers own the container.
 */
export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  icon = "books",
  size = "md",
}: EmptyStateProps) => {
  const Icon = ICONS[icon];
  const isSm = size === "sm";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${isSm ? "p-6" : "p-10"}`}
    >
      <div
        className={`bg-base-200 rounded-full flex items-center justify-center ${isSm ? "p-3 mb-3" : "p-6 mb-6"}`}
      >
        <Icon
          className={`text-base-content/40 ${isSm ? "h-6 w-6" : "h-12 w-12"}`}
        />
      </div>

      <h3 className={`font-bold text-base-content ${isSm ? "text-sm" : "text-xl"}`}>
        {title}
      </h3>
      {message && (
        <p
          className={`text-base-content/60 max-w-sm mx-auto ${isSm ? "text-xs mt-1" : "mt-2"}`}
        >
          {message}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`btn btn-primary ${isSm ? "btn-sm mt-4" : "mt-8 px-10"}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
