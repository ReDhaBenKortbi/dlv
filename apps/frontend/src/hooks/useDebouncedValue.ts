import { useEffect, useState } from "react";

/**
 * Trails `value` by `delayMs`, so fast-changing input (a search box) drives at
 * most one request per pause instead of one per keystroke.
 *
 * A genuine effect: it subscribes to a timer and cleans it up.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
