import { API_URL } from '../config/env';

// Access token lives in memory only — never persisted (localStorage/sessionStorage
// are readable by any injected script). The refresh token lives in an httpOnly
// cookie the browser attaches automatically; JS never sees it.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * A non-2xx response, carrying the status so callers can branch on it —
 * a retry policy needs to tell "server hiccup, try again" from "not
 * authorised, retrying will never help".
 *
 * Written with an explicit field rather than a parameter property because
 * `erasableSyntaxOnly` is on.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** 401/403 — a retry cannot fix these. */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    setAccessToken(null);
    return false;
  }

  const data = await res.json();
  setAccessToken(data.accessToken);
  return true;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const makeHeaders = (): Record<string, string> => {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: makeHeaders(),
  });

  if (res.status === 401) {
    if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
    const ok = await refreshing;
    if (ok) {
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: makeHeaders(),
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    // Nest sends a plain string for HttpExceptions but an array of strings for
    // class-validator failures; flatten both to one readable line.
    const message = Array.isArray(err?.message)
      ? err.message.join(". ")
      : err?.message;
    throw new ApiError(
      typeof message === "string" && message.trim() ? message : res.statusText,
      res.status,
    );
  }

  // A handler that returns null/void (GET .../reviews/mine with no review,
  // POST .../cancel-pending) sends an empty body with a 2xx — not the text
  // "null". Calling res.json() on that throws a SyntaxError, which surfaced as
  // a failed query that kept its previous data, so a deleted review still
  // looked submitted. 204 arrives here as an empty body too.
  const text = await res.text();
  if (!text) return null as T;

  return JSON.parse(text) as T;
}
