Debug transcript for Neon Auth + React + Vite signup 405 fix.

## Problem
Sign-up returned 405. Root cause: `auth-client.ts` pointing better-auth at `VITE_CONVEX_SITE_URL` (`https://giant-ant-97.convex.site`). That Convex deployment was deleted in the Neon migration. No Convex proxy needed for Neon migration. Better Auth / Neon uses same-origin or NEON_AUTH_URL, not Convex site proxy.

## Debugging Steps

### 1. Check current auth-client.ts
File: `/home/website/src/lib/auth-client.ts`
The old logic: `VITE_CONVEX_SITE_URL || DEV ? undefined : '/api/auth'` was buggy (operator precedence) and `/api/auth` is invalid as absolute baseURL for better-auth, causing "Invalid base URL: /api/auth" and blanking homepage (root empty).

### 2. Test Neon Auth endpoint directly
```bash
# This works - Neon Auth endpoint (no /api/auth prefix)
curl -s -X POST "https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"test"}'

# This 404s - /api/auth prefix not used by Neon Auth
curl -s -X POST "https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth/api/auth/sign-up/email" -H "Content-Type: application/json" -d '{}' 2>&1 | head -c 200
# → 404
```

### 3. Test get-session with cookie
```bash
AUTH=$(grep '^NEON_AUTH_URL=' /home/website/.env | cut -d= -f2-)
curl -s "$AUTH/get-session" -H "Origin: https://nostalgichillax.pages.dev" -b /tmp/cookies.txt 2>&1 | head -c 200
# → null (before fix), then {"token":null,...} (after fix, user created but unverified)
```

### 4. Fix auth-client.ts
Replace baseURL logic to prefer VITE_NEON_AUTH_URL, fall back to hardcoded Neon URL, then window.location.origin.

### 5. Fix vite.config.ts
Proxy `/api/auth` to Neon origin:
```ts
server: proxyTarget
  ? { proxy: { '/api/auth': { target: proxyTarget, changeOrigin: true, secure: true } } }
  : undefined,
```

### 6. Fix AuthModal.tsx
Detect EMAIL_NOT_VERIFIED and show actionable message + auto-swap to login mode.

### 7. Fix RNGSection.tsx
Also check authClient.useSession() alongside useConvexAuth(), since Convex is dummy after Neon migration.

### 8. Set VITE_NEON_AUTH_URL in Cloudflare Pages
Dashboard → Settings → Functions → Bindings → Add → Hyperdrive → name: HYPERDRIVE → Public database → paste Neon URL → Save

## Outcome
- Signup returns 200, creates user with token:null + emailVerified:false
- AuthModal detects this and shows: "Account created — check email to verify, then log in"
- After disabling "Require email verification" in Neon dashboard: auto-login works
- Site build no longer 405s from auth-client

## References
- Neon Auth URL: https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth
- Old Convex URL (removed): https://giant-ant-97.convex.site