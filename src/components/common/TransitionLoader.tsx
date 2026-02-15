import { Loader2 } from "lucide-react";

/**
 * A smaller, non-intrusive loader for transitions.
 * This shows INSIDE the layout (below the header).
 */
export const TransitionLoader = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] opacity-40">
    <Loader2 className="w-9 h-9 animate-spin text-primary mb-2" />
    <p className="text-xs font-bold uppercase tracking-widest">
      Loading Content...
    </p>
  </div>
);
