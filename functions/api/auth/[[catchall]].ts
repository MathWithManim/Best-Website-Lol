export interface Env {
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

let authInstance: any = null;

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

  const connectionString =
    env.HYPERDRIVE?.connectionString || env.DATABASE_URL || (process.env as any)?.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL / HYPERDRIVE connection string is not set in environment!');
  }

  const { betterAuth } = await import('better-auth');
  const { neon } = await import('@neondatabase/serverless');

  authInstance = betterAuth({
    database: neon(connectionString) as any,
    logger: noopLogger as any,
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'default-secret-change-in-production',
    baseURL: env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:5173',
    trustedOrigins: [
      env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'https://nostalgiachillax.pages.dev',
      'https://jasper.nostalgiachillax.pages.dev',
    ],
  });

  return authInstance;
}

export async function onRequest(context: { env: Env; request: Request }) {
  try {
    const auth = await getAuth(context.env);
    return await auth.handler(context.request);
  } catch (error: any) {
    console.error('[AuthHandler] Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(
      JSON.stringify({
        error: error?.message || 'Internal Server Error',
        code: 'AUTH_INIT_FAILURE',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
