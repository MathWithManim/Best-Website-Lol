import { createAuthClient } from 'better-auth/react';

// Priority: explicit Neon Auth URL > legacy Convex site URL > same-origin fallback.
// VITE_NEON_AUTH_URL must be an absolute URL, e.g.
//   https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth
// For local dev, vite.config proxies /api/auth -> NEON_AUTH_URL so
// window.location.origin also works.
let baseURL: string | undefined;
try {
  const env = (import.meta as any).env ?? {};
  const neonUrl = (env.VITE_NEON_AUTH_URL as string | undefined)
    || (env.VITE_CONVEX_SITE_URL as string | undefined); // legacy fallback
  if (neonUrl && neonUrl !== '/api/auth') {
    baseURL = neonUrl;
  } else if (typeof window !== 'undefined') {
    baseURL = window.location.origin;
  } else {
    baseURL = undefined;
  }
  if (baseURL === '/api/auth') baseURL = undefined;
} catch {
  baseURL = undefined;
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [],
});
