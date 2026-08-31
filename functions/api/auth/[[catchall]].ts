export interface Env {
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
}

let authInstance: any = null;
let poolInstance: any = null;

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child: () => noopLogger,
};

export async function getAuth(env: Env) {
  if (authInstance) return authInstance;
  console.log("getAuth called. Env keys:", Object.keys(env));

  const connectionString =
    env.HYPERDRIVE?.connectionString || env.DATABASE_URL || (process.env as any)?.DATABASE_URL;
  console.log("Connection string found:", !!connectionString);
  
  if (!connectionString) {
    throw new Error("DATABASE_URL / HYPERDRIVE connection string is not set in environment!");
  }

  // Dynamic imports keep module evaluation trivial — a failure here is caught
  // by onRequest and returned as JSON instead of a blank 500.
  const { betterAuth } = await import("better-auth");
  const { Pool } = await import("@neondatabase/serverless");

  poolInstance = new Pool({
    connectionString,
  });


  const { neon } = await import("@neondatabase/serverless");
  authInstance = betterAuth({
    database: neon(connectionString) as any,
    logger: noopLogger as any,
    emailAndPassword: { enabled: true },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  });

  return authInstance;
}

export async function onRequest(context: { env: Env; request: Request }) {
  try {
    const auth = await getAuth(context.env);
    return await auth.handler(context.request);
  } catch (error: any) {
    console.error("[AuthHandler] Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(
      JSON.stringify({
        error: error?.message || "Internal Server Error",
        stack: error?.stack,
        details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        code: "AUTH_INIT_FAILURE",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}