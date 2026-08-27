import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL || import.meta.env.DEV ? undefined : '/api/auth',
  plugins: [],
});