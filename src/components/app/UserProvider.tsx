import { type ReactNode, useState, useEffect } from 'react';

import { UserContext } from '../../lib/useUser';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [sessionUser, setSessionUser] = useState<{ email: string; name: string; id: string } | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/get-session', { credentials: 'include' })
      .then(r => r.json())
      .then((data: any) => {
        if (cancelled) return;
        setSessionUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setSessionUser(null);
      });
    return () => { cancelled = true; };
  }, []);

  const isAuthenticated = sessionUser != null && !!sessionUser.email;

  let user: any = undefined;
  if (isAuthenticated && sessionUser) {
    user = {
      email: sessionUser.email,
      username: sessionUser.name || sessionUser.email?.split('@')[0] || 'user',
      name: sessionUser.name || '',
      bio: '',
      pfp: '',
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

  let overrides: Record<string, string> = {};
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('profile:overrides:v1') : null;
    if (raw) overrides = JSON.parse(raw);
  } catch {}
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

  user = applyOverrides(user);

  const value = sessionUser === undefined ? undefined : (isAuthenticated ? user ?? null : null);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
