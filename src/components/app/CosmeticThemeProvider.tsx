import { createContext, type ReactNode, useState, useEffect } from 'react';
import { useQuery, api } from '../../convex/_generated/api';
import { useUser } from '../../lib/useUser';



interface CosmeticTheme {
  bg: string;
  primary: string;
  accent: string;
}

const CosmeticThemeContext = createContext<CosmeticTheme | null>(null);

export const CosmeticThemeProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser();
  let cosmetics: any = undefined;
  try {
    cosmetics = useQuery((api as any)?.shop?.getCosmetics ?? 'shop.getCosmetics' as any);
  } catch {
    cosmetics = undefined;
  }
  const [theme, setTheme] = useState<CosmeticTheme | null>(null);
  
  useEffect(() => {
    const equipped = (user as any)?.equippedCosmetic;
    const cosmeticTheme = (cosmetics as any)?.find?.((c: any) => c.id === equipped)?.theme;
    setTheme(cosmeticTheme || null);
  }, [user, cosmetics]);

  const themeStyle = theme ? {
    '--app-bg': theme.bg,
    '--app-primary': theme.primary,
    '--app-accent': theme.accent,
  } as React.CSSProperties : {};

  return (
    <CosmeticThemeContext.Provider value={theme}>
      <div style={themeStyle} className="contents">
        {children}
      </div>
    </CosmeticThemeContext.Provider>
  );
};
