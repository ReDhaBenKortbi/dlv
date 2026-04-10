import { Timestamp } from "firebase/firestore";

/** Convert a Firestore Timestamp (or Date) to a plain JS Date. */
export function tsToDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  // Fallback: Firestore sometimes returns server-timestamp placeholders
  return new Date(0);
}

/** Convert a Firestore Timestamp (or Date) to a plain JS Date, or undefined. */
export function tsToDateOpt(value: unknown): Date | undefined {
  if (value == null) return undefined;
  return tsToDate(value);
}
