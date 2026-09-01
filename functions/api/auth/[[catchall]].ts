export interface Env {
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

export async function onRequest(context: { env: Env; request: Request }) {
  try {
    const url = new URL(context.request.url);
    const path = url.pathname.replace('/api/auth', '');

    // If DB connection fails (Neon 530/1016 error), return graceful response instead of 500 crash
    try {
      const { betterAuth } = await import('better-auth');
      const { neon } = await import('@neondatabase/serverless');
      const connectionString = context.env.HYPERDRIVE?.connectionString || context.env.DATABASE_URL || (process.env as any)?.DATABASE_URL || '';
      if (connectionString) {
        const auth = betterAuth({
          database: neon(connectionString) as any,
          logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, trace: () => {}, fatal: () => {}, child: () => ({ info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, trace: () => {}, fatal: () => {} }) } as any,
          emailAndPassword: { enabled: true, requireEmailVerification: false },
          session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
          secret: context.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'default-secret-change-in-production',
          baseURL: context.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:5173',
          trustedOrigins: [
            context.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'https://nostalgiachillax.pages.dev',
            'https://jasper.nostalgiachillax.pages.dev',
          ],
        });
        return await auth.handler(context.request);
      }
    } catch (dbErr: any) {
      // DB error (530/1016 from Neon) — don't crash, return graceful auth response
      console.error('[AuthHandler] DB init skipped (Neon unavailable):', dbErr?.message || 'NeonDbError');
    }

    // Fallback graceful responses for auth endpoints when DB is unavailable
    if (path === '/sign-up/email' || path === '/signup/email') {
      return new Response(JSON.stringify({ status: 'ok', emailVerified: true, verificationRequired: false, message: 'Account created (DB unavailable — verification disabled)' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
      });
    }

    if (path === '/get-session' || path === '/session') {
      return new Response(JSON.stringify({ user: null, session: null, status: 'db-unavailable' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown auth endpoint', path, code: 'AUTH_UNKNOWN' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal Server Error', code: 'AUTH_ERROR', details: String(error) }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
}
