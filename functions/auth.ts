import { betterAuth } from "better-auth";
import { Pool } from "pg";

export interface Env {
  HYPERDRIVE?: { connectionString: string };
}

const pool = new Pool({
  connectionString: (process.env as any)?.HYPERDRIVE?.connectionString || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const auth = betterAuth({
  database: pool as any,
  logger: false,
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
});

export async function onRequest(context: { env: Env; request: Request }) {
  // Fixes AUTH_FAILURE / Symbol(pino.msgPrefix): disable broken logger, pass to handler
  return auth.handler(context.request);
}
