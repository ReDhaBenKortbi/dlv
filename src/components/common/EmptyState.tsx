import { Book, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** * Adding types here makes it easy to add more icons later
   * e.g., "favorites" | "error"
   */
  icon?: "books" | "search";
}

/**
 * ICON_MAP: A centralized dictionary for our icons.
 * This keeps the JSX clean and the logic separated.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  books: Book,
  search: Search,
};

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  icon = "books",
}: EmptyStateProps) => {
  // Grab the component from our map based on the prop
  const IconComponent = ICON_MAP[icon] || Book;

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center animate-fadeIn">
      {/* Icon Circle */}
      <div className="bg-gray-100 dark:bg-base-300 p-6 rounded-full mb-6 flex items-center justify-center">
        <IconComponent
          className="h-12 w-12 text-gray-400 dark:text-gray-500"
          strokeWidth={1.5}
        />
      </div>

      {/* Textual Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
          {message}
        </p>
      </div>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary mt-8 px-10 shadow-sm hover:shadow-md transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
