import { betterAuth } from "better-auth";
import { Pool } from "pg";

export interface Env {
  HYPERDRIVE?: { connectionString: string };
}

const pool = new Pool({
  connectionString: (process.env as any)?.HYPERDRIVE?.connectionString || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// No-op logger to prevent pino crash in Workers environment
const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child: () => noopLogger,
};

const auth = betterAuth({
  database: pool as any,
  logger: noopLogger as any,
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
});

export async function onRequest(context: { env: Env; request: Request }) {
  return auth.handler(context.request);
}
