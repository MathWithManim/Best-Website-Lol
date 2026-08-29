# Neon Auth %20 404 — Trailing Whitespace in VITE_NEON_AUTH_URL

**Date:** 2026-08-29
**Symptom:** `Create Account → Route POST:/neondb/auth%20/sign-up/email not found [404]`
**UI:** AuthModal red alert showed `POST:/neondb/auth%20/sign-up/email` with `%20` between `auth` and `/sign-up`.

## Root Cause

`VITE_NEON_AUTH_URL` had trailing whitespace (space/newline from Cloudflare Pages dashboard copy-paste or .env). Value looked like:
`https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth<space>`

`auth-client.ts` passed it straight to `createAuthClient({ baseURL })`. better-auth's client uses `@better-fetch/fetch` which does:

```js
// node_modules/@better-fetch/fetch/dist/index.js
let baseURL = options.baseURL;
if (baseURL && !baseURL.endsWith("/")) baseURL = baseURL + "/";
if (url.startsWith("/")) _url = new URL(url.substring(1), baseURL);
```

With `baseURL = "https://.../neondb/auth "` → becomes `"https://.../neondb/auth /"` → `new URL("sign-up/email", "https://.../auth /")` → `https://.../neondb/auth%20/sign-up/email`. The space is percent-encoded as `%20`, so Neon sees path `/neondb/auth%20/sign-up/email` and 404s with:
`{"message":"Route POST:/neondb/auth%20/sign-up/email not found","error":"Not Found","statusCode":404}`

`.env` on disk was clean (`od -c` showed no `0x20`), but the Pages build had baked the space from the dashboard env var. `better-auth/dist/utils/url.mjs::withPath` keeps the full path when `checkHasPath(url)` is true, so it doesn't strip whitespace either.

## Reproduction

```bash
# Correct URL — 200 with Origin header (token:null when verification required)
curl -X POST "https://ep-soft-wind-...neon.tech/neondb/auth/sign-up/email" \
  -H "Content-Type: application/json" -H "Origin: https://nostalgichillax.pages.dev" \
  -d '{"email":"a@b.com","password":"12345678","name":"a"}'
# → 200 {"token":null,"user":{"emailVerified":false,...}}

# With %20 — reproduces exact 404
curl -X POST "https://ep-soft-wind-...neon.tech/neondb/auth%20/sign-up/email" \
  -H "Content-Type: application/json" -H "Origin: https://nostalgichillax.pages.dev" \
  -d '{"email":"a@b.com","password":"12345678","name":"a"}'
# → 404 {"message":"Route POST:/neondb/auth%20/sign-up/email not found"}
```

## Fix

`src/lib/auth-client.ts` (commit 5f9ef68):
```ts
const rawNeonUrl = (env.VITE_NEON_AUTH_URL as string | undefined)
  || (env.VITE_CONVEX_SITE_URL as string | undefined)
  || hardcodedNeon;
const neonUrl = rawNeonUrl?.trim().replace(/\s+/g, '');
if (rawNeonUrl !== neonUrl) console.warn('[auth-client] trimmed VITE_NEON_AUTH_URL whitespace');
```

Also check `vite.config.ts` proxy: `new URL(neonAuthUrl)` throws on trailing space and disables proxy; trimming there too is prudent.

## Checklist

- [ ] Trim env var in code (done)
- [ ] Clean `VITE_NEON_AUTH_URL` in Cloudflare Pages → Settings → Environment variables (Production + Preview) — re-paste without trailing space
- [ ] Redeploy (Pages trigger on push or manual retry)
- [ ] Verify `dist/assets/*.js` contains `trim().replace` and no `auth%20` literal
- [ ] Test signup with fresh email — should get 200 and AuthModal "check email to verify" (when verification ON) instead of 404

## Lesson

Env vars from dashboards are opaque strings — always `.trim()` URLs before passing to `better-auth`/`better-fetch`. The `%20` in a 404 route is the tell for trailing whitespace.
