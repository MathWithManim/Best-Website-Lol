import { db, users } from "../../db";
import { type ReactNode } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';

import { UserContext } from '../lib/useUser';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : 'skip'
  );

  const value = isLoading || (!isAuthenticated && user === undefined) ? undefined : (isAuthenticated ? user ?? null : null);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};