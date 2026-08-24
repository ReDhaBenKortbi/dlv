type ClassValue = string | false | null | undefined;

/**
 * Joins conditional class names, dropping falsy entries.
 *
 * Deliberately dependency-free: the codebase's need is `cn("base", cond && "x")`,
 * which doesn't justify pulling in clsx. Note this does NOT resolve conflicting
 * Tailwind utilities — order classes so the intended one wins.
 */
export const cn = (...parts: ClassValue[]): string => parts.filter(Boolean).join(" ");
