import { type ReactNode } from 'react';

const DbContext = { Provider: ({ children }: { children: ReactNode }) => children };
export const useDb = () => ({} as any);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export default ConvexClientProvider;

// never throw "Could not find Convex client!" even when VITE_CONVEX_URL is unset
// (Neon migration). The dummy URL satisfies Convex's deployment-name parser;
// queries/mutations will just stay in pending state and be handled by Neon fallbacks.
const convexUrl =
  ((import.meta as any).env?.VITE_CONVEX_URL as string | undefined) ||
  'https://gorgeous-sloth-123.convex.cloud';

let convex: any;
try {
  const { ConvexReactClient: Client } = require('../convex/_generated/api');
  convex = new Client(convexUrl);
} catch (e: any) {
  console.warn('[ConvexClientProvider] Using dummy:', e);
  const { ConvexReactClient: Client } = require('../convex/_generated/api');
  convex = new Client('https://gorgeous-sloth-123.convex.cloud');
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const content = <DbContext.Provider value={db}>{children}</DbContext.Provider>;
  return <ConvexProvider client={convex}>{content}</ConvexProvider>;
}
export default ConvexClientProvider;
