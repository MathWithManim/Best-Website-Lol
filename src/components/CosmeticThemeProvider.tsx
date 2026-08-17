import { createContext, type ReactNode, useState, useEffect } from 'react';
import { useUser } from './UserProvider';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const CosmeticThemeContext = createContext<any>(null);

export const CosmeticThemeProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser();
  const cosmetics = useQuery(api.shop.getCosmetics);
  const [theme, setTheme] = useState<any>(null);
  
  useEffect(() => {
    const equipped = user?.equippedCosmetic;
    const cosmeticTheme = cosmetics?.find((c: any) => c.id === equipped)?.theme;
    setTheme(cosmeticTheme);
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
