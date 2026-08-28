import { type ReactNode } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';

import { UserContext } from '../../lib/useUser';
import { api } from "../../convex/_generated/api";

export const UserProvider = ({ children }: { children: ReactNode }) => {
  let isAuthenticated = false;
  let isLoading = false;
  try {
    const auth = useConvexAuth();
    isAuthenticated = auth.isAuthenticated;
    isLoading = auth.isLoading;
  } catch {
    // No Convex provider or dummy client — treat as guest
    isAuthenticated = false;
    isLoading = false;
  }

  let user: any = undefined;
  try {
    // Only query when authenticated; stub api returns string, dummy client will just return undefined
    const q = useQuery(
      (api as any)?.users?.getCurrentUser ?? 'users.getCurrentUser' as any,
      isAuthenticated ? {} : 'skip'
    );
    user = q;
  } catch {
    user = null;
  }

  const value = isLoading || (!isAuthenticated && user === undefined) ? undefined : (isAuthenticated ? user ?? null : null);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
