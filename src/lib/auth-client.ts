import { createAuthClient } from 'better-auth/react';

function getBaseURL(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
}

export const authClient = createAuthClient({
  baseURL: getBaseURL() + '/api/auth',
});
