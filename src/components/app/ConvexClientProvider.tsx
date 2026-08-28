import { createContext, useContext, type ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { db } from '../../db';

const DbContext = createContext(db);
export const useDb = () => useContext(DbContext);

// Convex is optional after Drizzle migration — homepage should not crash if it's missing.
// Use VITE_CONVEX_URL if available, otherwise provide a dummy client that never authenticates.
const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;

// Create client lazily — don't throw at import time
let convex: ConvexReactClient | null = null;
const effectiveUrl = convexUrl || 'https://dummy.convex.cloud';
try {
  convex = new ConvexReactClient(effectiveUrl);
  if (!convexUrl) {
    console.warn('[ConvexClientProvider] VITE_CONVEX_URL not set — using dummy Convex client (guest mode, homepage will render).');
  }
} catch (e) {
  console.warn('[ConvexClientProvider] Failed to create Convex client:', e);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const content = <DbContext.Provider value={db}>{children}</DbContext.Provider>;
  if (convex) {
    return <ConvexProvider client={convex}>{content}</ConvexProvider>;
  }
  return content;
}
export default ConvexClientProvider;
