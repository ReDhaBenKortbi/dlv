import type { CookieOptions } from 'express';

export const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Frontend (Netlify) and API run on different origins, so the cookie must be
// SameSite=None to be sent cross-site — which requires Secure. In dev both
// run on http://localhost, so we fall back to Lax without Secure there.
export function refreshCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: SEVEN_DAYS_MS,
  };
}
