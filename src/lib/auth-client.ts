import { createAuthClient } from 'better-auth/react';

// Priority: explicit Neon Auth URL > legacy Convex site URL > same-origin fallback.
// VITE_NEON_AUTH_URL must be an absolute URL, e.g.
//   https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth
// For local dev, vite.config proxies /api/auth -> NEON_AUTH_URL so
// window.location.origin also works.
let baseURL: string | undefined;
try {
  const env = (import.meta as any).env ?? {};
  // Hardcoded Neon Auth as last-resort build-time fallback so Pages deploys
  // without VITE_NEON_AUTH_URL still work (dashboard env may be missing).
  const hardcodedNeon = 'https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth';
  const rawNeonUrl = (env.VITE_NEON_AUTH_URL as string | undefined)
    || (env.VITE_CONVEX_SITE_URL as string | undefined)
    || hardcodedNeon;
  // Trim whitespace/newlines — a trailing space in dashboard env var becomes %20 in fetch URL
  // and causes 404: POST:/neondb/auth%20/sign-up/email not found
  const neonUrl = rawNeonUrl?.trim().replace(/\s+/g, '');
  if (neonUrl && neonUrl !== '/api/auth') {
    baseURL = neonUrl;
    if (rawNeonUrl !== neonUrl) console.warn('[auth-client] trimmed VITE_NEON_AUTH_URL whitespace');
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
