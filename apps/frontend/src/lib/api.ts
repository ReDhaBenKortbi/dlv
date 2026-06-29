const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const rt = localStorage.getItem('refreshToken');
  if (!rt) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return true;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const makeHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  let res = await fetch(`${API_URL}${path}`, { ...options, headers: makeHeaders() });

  if (res.status === 401 && localStorage.getItem('refreshToken')) {
    if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
    const ok = await refreshing;
    if (ok) {
      res = await fetch(`${API_URL}${path}`, { ...options, headers: makeHeaders() });
    }
  }

  if (res.status === 204) return null as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
