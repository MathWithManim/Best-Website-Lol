import { type ReactNode } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';

import { UserContext } from '../../lib/useUser';
import { api } from "../../convex/_generated/api";
import { authClient } from '../../lib/auth-client';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Hooks must be called unconditionally — call both then branch on results
  let baSession: any = undefined;
  try { baSession = (authClient as any).useSession?.(); } catch { baSession = undefined; }
  let convexAuth: any = { isAuthenticated: false, isLoading: false };
  try { convexAuth = useConvexAuth(); } catch { convexAuth = { isAuthenticated: false, isLoading: false }; }

  let isAuthenticated = false;
  let isLoading = false;
  if (baSession !== undefined) {
    if (baSession?.data?.user) {
      isAuthenticated = true;
      isLoading = false;
    } else if (baSession?.isPending) {
      isLoading = true;
      isAuthenticated = false;
    } else {
      isAuthenticated = convexAuth.isAuthenticated;
      isLoading = convexAuth.isLoading;
    }
  } else {
    isAuthenticated = convexAuth.isAuthenticated;
    isLoading = convexAuth.isLoading;
  }

  let convexUser: any = undefined;
  try {
    const q = useQuery(
      (api as any)?.users?.getCurrentUser ?? 'users.getCurrentUser' as any,
      isAuthenticated ? {} : 'skip'
    );
    convexUser = q;
  } catch { convexUser = null; }

  let user: any = convexUser;
  const baUser = baSession?.data?.user;
  // local overrides (bio/username/pfp edited via RNG settings gear) — read once
  let overrides: Record<string, string> = {};
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('profile:overrides:v1') : null;
    if (raw) overrides = JSON.parse(raw);
  } catch {}
  // merge overrides into any user object so AccountSettingsModal edits show immediately
  const applyOverrides = (u: any) => {
    if (!u || !overrides || Object.keys(overrides).length === 0) return u;
    return {
      ...u,
      name: overrides.name ?? u.name,
      username: overrides.username ?? u.username,
      bio: overrides.bio ?? u.bio,
      pfp: overrides.pfp ?? u.pfp,
      image: overrides.pfp ?? u.image,
    };
  };

  if (isAuthenticated && baUser && (convexUser === null || convexUser === undefined)) {
    user = {
      email: baUser.email,
      username: baUser.name || baUser.email?.split('@')[0] || 'user',
      name: baUser.name || '',
      bio: '',
      pfp: baUser.image || '',
      luckbucks: 0,
      equippedCosmetic: undefined,
      rebirthCount: 0,
      rollCount: 0,
      nextRollCost: 0,
      distinctCaught: 0,
      totalRarities: 50,
      nextRebirthAt: 10,
      completedGame: false,
      prestigeCount: 0,
      discovered: {},
      achievements: [],
    };
  }
  user = applyOverrides(user);

  const value = isLoading || (!isAuthenticated && user === undefined) ? undefined : (isAuthenticated ? user ?? null : null);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
