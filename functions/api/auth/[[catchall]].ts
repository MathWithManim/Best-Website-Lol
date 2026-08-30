import { betterAuth } from "better-auth";
import { Pool } from "pg";

export interface Env {
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
}

let authInstance: any = null;
let poolInstance: Pool | null = null;

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child: () => noopLogger,
};

function getAuth(env: Env) {
  if (authInstance) return authInstance;

  const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL || (process.env as any)?.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL / HYPERDRIVE connection string is not set in environment!");
  }

  poolInstance = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  authInstance = betterAuth({
    database: poolInstance as any,
    logger: noopLogger as any,
    emailAndPassword: { enabled: true },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  });

  return authInstance;
}

export async function onRequest(context: { env: Env; request: Request }) {
  try {
    const auth = getAuth(context.env);
    return await auth.handler(context.request);
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error during auth initialization",
        code: "AUTH_INIT_FAILURE",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
