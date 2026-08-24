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

  if (res.status === 204) return null as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
