import { createContext, type ReactNode, useState, useEffect } from 'react';
import { useUser } from '../lib/useUser';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface CosmeticTheme {
  bg: string;
  primary: string;
  accent: string;
}

const CosmeticThemeContext = createContext<CosmeticTheme | null>(null);

export const CosmeticThemeProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser();
  const cosmetics = useQuery(api.shop.getCosmetics);
  const [theme, setTheme] = useState<CosmeticTheme | null>(null);
  
  useEffect(() => {
    const equipped = user?.equippedCosmetic;
    const cosmeticTheme = cosmetics?.find((c) => c.id === equipped)?.theme;
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
