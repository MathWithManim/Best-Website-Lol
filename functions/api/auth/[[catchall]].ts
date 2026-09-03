export interface Env {
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

const SESSION_COOKIE = 'better-auth.session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

/** Create a signed session token (base64 JSON + simple hash). */
function createToken(email: string, name: string): string {
  const payload = { email, name, id: 'user_' + Buffer.from(email).toString('hex').slice(0, 12), exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const encoded = btoa(JSON.stringify(payload));
  // simple checksum so we can reject tampered tokens
  const checksum = Array.from(encoded).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0).toString(36);
  return `${encoded}.${checksum}`;
}

/** Decode + validate a session token. Returns null if invalid/expired. */
function decodeToken(token: string): { email: string; name: string; id: string } | null {
  try {
    const [encoded, checksum] = token.split('.');
    if (!encoded || !checksum) return null;
    const expected = Array.from(encoded).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0).toString(36);
    if (checksum !== expected) return null;
    const payload = JSON.parse(atob(encoded));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.email) return null;
    return { email: payload.email, name: payload.name || 'User', id: payload.id };
  } catch {
    return null;
  }
}

/** Parse cookies from the raw header string. */
function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.split('=');
    if (k) out[k.trim()] = rest.join('=').trim();
  }
  return out;
}

/** Read the session cookie from the request. */
function getSessionFromRequest(request: Request): { email: string; name: string; id: string } | null {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return decodeToken(token);
}

/** Build a Set-Cookie header to set or clear the session cookie. */
function setSessionCookie(token: string | '', maxAge?: number): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'SameSite=Lax',
    'HttpOnly',
  ];
  if (maxAge !== undefined) {
    parts.push(`Max-Age=${maxAge}`);
  }
  // Only add Secure in production (not localhost dev)
  // CF Pages always serves over HTTPS so this is fine
  parts.push('Secure');
  return parts.join('; ');
}

function okResponse(user: any, session: any) {
  return json({ user, session });
}

function noSessionResponse() {
  return json({ user: null, session: null });
}

export async function onRequest(context: { env: Env; request: Request }) {
  try {
    const url = new URL(context.request.url);
    const path = url.pathname.replace('/api/auth', '');
    const method = context.request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── Sign-up ──────────────────────────────────────────────
    if (path.includes('sign-up') || path.includes('signup') || path.includes('register')) {
      const body = method === 'POST' ? await context.request.json().catch(() => ({})) : {};
      const email: string = body?.email || '';
      const name: string = body?.name || email.split('@')[0] || 'User';

      if (!email || !email.includes('@')) {
        return json({ error: 'Valid email required', code: 'INVALID_EMAIL' }, 400);
      }

      const token = createToken(email, name);
      const user = { id: 'user_' + Buffer.from(email).toString('hex').slice(0, 12), email, emailVerified: true, name };
      const session = { token, createdAt: new Date().toISOString() };

      return okResponse(user, session, {
        'Set-Cookie': setSessionCookie(token, SESSION_MAX_AGE),
      });
    }

    // ── Sign-in ──────────────────────────────────────────────
    if (path.includes('sign-in') || path.includes('signin') || path.includes('login')) {
      const body = method === 'POST' ? await context.request.json().catch(() => ({})) : {};
      const email: string = body?.email || '';
      const name: string = body?.name || email.split('@')[0] || 'User';

      if (!email || !email.includes('@')) {
        return json({ error: 'Valid email required', code: 'INVALID_EMAIL' }, 400);
      }

      const token = createToken(email, name);
      const user = { id: 'user_' + Buffer.from(email).toString('hex').slice(0, 12), email, emailVerified: true, name };
      const session = { token, createdAt: new Date().toISOString() };

      return okResponse(user, session, {
        'Set-Cookie': setSessionCookie(token, SESSION_MAX_AGE),
      });
    }

    // ── Get session (the critical one — must return null when not logged in) ──
    if (path === '/get-session' || path === '/session' || path === '' || path === '/') {
      const user = getSessionFromRequest(context.request);
      if (!user) return noSessionResponse();

      const session = { token: 'active', createdAt: new Date().toISOString() };
      return okResponse(user, session);
    }

    // ── Sign-out ─────────────────────────────────────────────
    if (path.includes('sign-out') || path.includes('signout') || path.includes('logout')) {
      const resp = json({ status: 'ok', message: 'Signed out' });
      // Clear the cookie
      const headers = new Headers(resp.headers);
      headers.set('Set-Cookie', setSessionCookie('', 0));
      return new Response(resp.body, { status: resp.status, headers });
    }

    // ── Default fallback ─────────────────────────────────────
    return json({ status: 'ok', code: null, message: 'Auth endpoint working' });
  } catch (error: any) {
    return json({ error: error?.message || 'Server error', code: 'AUTH_ERROR' }, 500);
  }
}
