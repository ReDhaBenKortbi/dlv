import { useCallback, useRef } from "react";

interface StickyPayBarProps {
  /** Null until a payable plan is picked — the bar shows a hint instead. */
  selection: {
    label: string;
    price: number;
    /** Monthly subscription rather than a one-off upgrade difference. */
    recurring: boolean;
  } | null;
  loading: boolean;
  onPay: () => void;
}

/**
 * The pay control, pinned to the bottom of the viewport so it never has to be
 * scrolled for.
 */
export const StickyPayBar = ({
  selection,
  loading,
  onPay,
}: StickyPayBarProps) => {
  // Publishes the bar's real height so other fixed elements (e.g. SupportFab)
  // can offset above it instead of overlapping it.
  // A callback ref (not useRef + useEffect) because the bar mounts late —
  // only after `plans` finishes loading — so a mount-only effect would
  // miss it entirely.
  const observer = useRef<ResizeObserver | null>(null);
  const barRef = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!el) {
      document.documentElement.style.removeProperty(
        "--sticky-bottom-bar-height",
      );
      return;
    }
    const publishHeight = () => {
      document.documentElement.style.setProperty(
        "--sticky-bottom-bar-height",
        `${el.offsetHeight}px`,
      );
    };
    publishHeight();
    observer.current = new ResizeObserver(publishHeight);
    observer.current.observe(el);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 inset-x-0 z-40 bg-base-100 border-t border-base-300 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {selection ? (
          <>
            <div className="min-w-0">
              <p className="text-xs opacity-60 truncate">{selection.label}</p>
              <p className="text-lg font-bold text-primary leading-tight">
                {selection.price} DA
                {selection.recurring && (
                  <span className="text-xs font-normal opacity-60"> / month</span>
                )}
              </p>
            </div>
            <button
              className={`btn btn-primary font-semibold shrink-0 ${loading ? "loading" : ""}`}
              disabled={loading}
              onClick={onPay}
            >
              {loading ? "Redirecting..." : `Pay ${selection.price} DA`}
            </button>
          </>
        ) : (
          <p className="text-sm opacity-50 w-full text-center py-2">
            Select a plan above to continue
          </p>
        )}
      </div>
    </div>
  );
};
