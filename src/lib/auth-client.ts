import { createAuthClient } from 'better-auth/react';

// VITE_CONVEX_SITE_URL should be https://giant-ant-97.convex.site etc.
// Old logic: `VITE_CONVEX_SITE_URL || DEV ? undefined : '/api/auth'` was buggy
// (operator precedence) and '/api/auth' is invalid as absolute baseURL for better-auth,
// causing "Invalid base URL: /api/auth" and blanking homepage (root empty).
// Make it resilient: use VITE_CONVEX_SITE_URL if set, otherwise same-origin or undefined.
let baseURL: string | undefined;
try {
  const envUrl = (import.meta as any).env?.VITE_CONVEX_SITE_URL as string | undefined;
  if (envUrl) {
    baseURL = envUrl;
  } else if (typeof window !== 'undefined') {
    // Same-origin fallback — valid absolute URL, won't throw
    baseURL = window.location.origin;
  } else {
    baseURL = undefined;
  }
  // Validate: better-auth needs absolute URL if provided
  if (baseURL === '/api/auth') baseURL = undefined;
} catch {
  baseURL = undefined;
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [],
});
