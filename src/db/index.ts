import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Vite exposes only VITE_* to browser. DATABASE_URL is server-only,
// but this module is imported in browser code (ConvexClientProvider).
// Don't throw at import time — homepage should render even without DB.
const getDatabaseUrl = (): string => {
  // Vite browser env
  try {
    // @ts-ignore - import.meta.env is Vite-specific
    const viteUrl = (import.meta as any)?.env?.VITE_DATABASE_URL || (import.meta as any)?.env?.DATABASE_URL;
    if (viteUrl) return viteUrl;
  } catch {}
  // Node / build env (Cloudflare Pages Functions, server, etc)
  const envUrl = typeof process !== 'undefined' ? (process as any).env?.DATABASE_URL : undefined;
  if (envUrl) return envUrl;
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && (process as any).env?.DATABASE_URL) return (process as any).env.DATABASE_URL;
  } catch {}
  return '';
};

const databaseUrl = getDatabaseUrl();

let _db: ReturnType<typeof drizzle> | null = null;

if (!databaseUrl) {
  console.warn('[db] DATABASE_URL not set — DB queries will fail, but homepage will still render.');
  // Proxy that only throws when you actually try to query, not on import
  _db = new Proxy({} as any, {
    get(_target, prop) {
      if (prop === 'then') return undefined; // don't look like a Promise
      return () => {
        throw new Error('DATABASE_URL not set — DB not available in browser. Move DB calls to server (Pages Functions) or set VITE_DATABASE_URL at build (insecure).');
      };
    },
  });
} else {
  const sql = neon(databaseUrl);
  _db = drizzle(sql, { schema });
}

export const db = _db as ReturnType<typeof drizzle>;
export * from './schema';
