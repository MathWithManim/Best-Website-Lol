import { ConvexReactClient, ConvexProvider } from '../../convex/_generated/api';
import { createContext, useContext, ReactNode } from 'react';
import { db } from '../../lib/db';

const DbContext = createContext(db);
export const useDb = () => useContext(DbContext);

// never throw "Could not find Convex client!" even when VITE_CONVEX_URL is unset
// (Neon migration). The dummy URL satisfies Convex's deployment-name parser;
// queries/mutations will just stay in pending state and be handled by Neon fallbacks.
const convexUrl =
  ((import.meta as any).env?.VITE_CONVEX_URL as string | undefined) ||
  'https://gorgeous-sloth-123.convex.cloud';

let convex: any;
try {
  convex = new ConvexReactClient(convexUrl);
} catch (e) {
  console.warn('[ConvexClientProvider] Failed to create Convex client, using dummy:', e);
  convex = new ConvexReactClient('https://gorgeous-sloth-123.convex.cloud');
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const content = <DbContext.Provider value={db}>{children}</DbContext.Provider>;
  return <ConvexProvider client={convex}>{content}</ConvexProvider>;
}
export default ConvexClientProvider;
