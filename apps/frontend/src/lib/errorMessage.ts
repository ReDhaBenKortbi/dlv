/**
 * Best-effort human-readable message for an unknown thrown value.
 *
 * `api()` throws `Error`s carrying the API's own message, so surfacing that
 * beats a generic "something failed" — a 409 should tell the user *what*
 * conflicted, not just that the save didn't work. `fallback` covers network
 * failures and anything thrown that isn't an Error.
 */
export function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}
