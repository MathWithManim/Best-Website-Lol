import { createContext, useContext, type ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { db } from '../../db';

const DbContext = createContext(db);
export const useDb = () => useContext(DbContext);

// Convex is optional after Drizzle migration — homepage should not crash if it's missing.
// Now that all useConvexAuth callers are resilient (try/catch → guest), we don't need
// a dummy client that would throw "[CONVEX FATAL ERROR] Couldn't parse deployment name".
const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;

let convex: ConvexReactClient | null = null;
if (convexUrl) {
  try {
    convex = new ConvexReactClient(convexUrl);
  } catch (e) {
    console.warn('[ConvexClientProvider] Failed to create Convex client:', e);
  }
} else {
  console.warn('[ConvexClientProvider] VITE_CONVEX_URL not set — Convex disabled, rendering as guest (homepage will still show).');
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const content = <DbContext.Provider value={db}>{children}</DbContext.Provider>;
  if (convex) {
    return <ConvexProvider client={convex}>{content}</ConvexProvider>;
  }
  return content;
}
export default ConvexClientProvider;
