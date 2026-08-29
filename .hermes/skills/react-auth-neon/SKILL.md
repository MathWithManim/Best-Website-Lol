---
name: react-auth-neon
description: Fix better-auth client configuration for Neon Auth in React + Vite + TypeScript projects after Convex migration. Covers auth-client baseURL resolution (incl. whitespace trimming for %20 404), VITE_NEON_AUTH_URL preference, vite.config proxy, hardcoded fallback for Pages builds, and AuthModal EMAIL_NOT_VERIFIED handling.
trigger: "when signing up and getting 405" / "Neon Auth EMAIL_NOT_VERIFIED" / "better-auth client Invalid base URL" / "Route POST:/neondb/auth%20/sign-up/email not found"
category: software-development
---

Fix better-auth client configuration for Neon Auth in React + Vite + TypeScript projects after Convex migration.

## When Signup Returns 405 / 404 %20 or Auth Fails

The 405 on signup happens because `auth-client.ts` was pointing better-auth at `VITE_CONVEX_SITE_URL` (`https://giant-ant-97.convex.site`). That Convex deployment was deleted in the Neon migration (`convex/http.ts` removed) so `POST /api/auth/sign-up/email` 405'd. The actual Neon Auth lives at `https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth` — endpoint is `/sign-up/email` (not `/api/auth/sign-up/email`).

## Fix: Point better-auth to Neon Auth

1. **Set VITE_NEON_AUTH_URL in Cloudflare Pages** (Production + Preview):
   `https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth`

2. **auth-client.ts** — prefers `VITE_NEON_AUTH_URL` over legacy `VITE_CONVEX_SITE_URL`; hardcoded fallback so Pages builds without dashboard var still work:

```ts
let baseURL: string | undefined;
try {
  const env = (import.meta as any).env ?? {};
  const rawNeonUrl = (env.VITE_NEON_AUTH_URL as string | undefined)
    || (env.VITE_CONVEX_SITE_URL as string | undefined)
    || 'https://ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth';
  // Trim whitespace/newlines — trailing space becomes %20 via better-fetch and
  // causes 404: Route POST:/neondb/auth%20/sign-up/email not found (2026-08-29)
  const neonUrl = rawNeonUrl?.trim().replace(/\s+/g, '');
  if (neonUrl && neonUrl !== '/api/auth') {
    baseURL = neonUrl;
    if (rawNeonUrl !== neonUrl) console.warn('[auth-client] trimmed VITE_NEON_AUTH_URL whitespace');
  } else if (typeof window !== 'undefined') {
    baseURL = window.location.origin;
  } else {
    baseURL = undefined;
  }
  if (baseURL === '/api/auth') baseURL = undefined;
} catch {
  baseURL = undefined;
}
```

3. **vite.config.ts** — proxy `/api/auth` to Neon origin for local dev:

```ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const neonAuthUrl = env.VITE_NEON_AUTH_URL || env.NEON_AUTH_URL || ''
  let proxyTarget = ''
  try { if (neonAuthUrl) proxyTarget = new URL(neonAuthUrl).origin } catch { proxyTarget = '' }
  return {
    plugins: [react()],
    server: proxyTarget
      ? { proxy: { '/api/auth': { target: proxyTarget, changeOrigin: true, secure: true } } }
      : undefined,
  }
})
```

4. **AuthModal.tsx** — handle `EMAIL_NOT_VERIFIED` when Neon has "Require email verification" ON:

```ts
if (lower.includes("email_not_verified") || (lower.includes("email") && lower.includes("not verified")) || lower.includes("verify your email")) {
  msg = `Account created for ${userEmail} — check your email to verify, then log in. (If you don't see it, check spam. Or ask admin to disable 'Require email verification' in Neon Auth dashboard for instant login.)`;
  if (mode === "signup") setMode("login");
}
```

5. **RNGSection.tsx** — also check `authClient.useSession()` alongside `useConvexAuth()`, since Convex is dummy after Neon migration. Unify auth: authenticated if EITHER Convex or Neon has a session.

## Verified

- `POST .../neondb/auth/sign-up/email` → 200 ✅
- `GET .../neondb/auth/get-session` → 200 with cookie ✅
- AuthModal shows verification message and auto-swaps to login mode ✅

## Pitfalls

- `VITE_CONVEX_SITE_URL` was the old Convex base; it 405s now because that deployment was removed in Neon migration
- Neon Auth endpoint is `/sign-up/email` (no `/api/auth` prefix); better-auth `withPath` keeps full path when baseURL has pathname
- Pages auto-build ignores `.env`; hardcoded fallback prevents 405 even if dashboard var missing
- Neon currently has "Require email verification = ON"; signUp returns 200 with `token:null` + `emailVerified:false`, then signIn → `EMAIL_NOT_VERIFIED`; AuthModal now handles it (see Human Check below for replacement)
- Trailing whitespace in `VITE_NEON_AUTH_URL` (dashboard copy-paste or .env newline) becomes `%20` via better-fetch (`baseURL + "/"` → `new URL("sign-up/email", ".../auth /")`) → 404 `POST:/neondb/auth%20/sign-up/email`; fix is `.trim().replace(/\s+/g, '')` on the env var before use — added 2026-08-29
- RNGSection only checking `useConvexAuth` (dummy) means game stays on AuthModal even after successful Neon sign-up

Support files:
- `references/auth-neon-whitespace-404.md` — 2026-08-29 %20 404 incident, better-fetch URL joining, and trim fix
- `references/auth-neon-workflow.md`
- `references/auth-neon-human-check.md` — 2026-08-29 6-digit human check pill, GSAP per-box loaders, red-budget fix — transcript of debugging session, exact curl commands + responses that fixed the issue
- `scripts/verify-auth-client.sh` — verifies the baseURL resolution order at build time

## 6. Human Check — 6-Digit Bot Gate (2026-08-29, replaces email verification)

User asked to disable Require email verification and replace it with an "r u a bot" gate: after Sign Up click, a bottom pill appears; user must type a specific 6-digit number shown on screen. Red is reserved for real errors — verification soft-success is a green popup, not a red alert.

Pattern (commit e42bd80, `src/components/app/AuthModal.tsx`):

- `handleSubmit` validates email/name/password; if `mode==="signup"` it does NOT call Neon yet — generates `captchaCode = Math.floor(100000+Math.random()*900000).toString()`, sets `showCaptcha=true`, stores `pendingSignup`, clears `captchaInput=["","","","","",""]`.
- Pill: `fixed bottom-6 left-1/2 -translate-x-1/2`, `rounded-[24px]`, GSAP enter `fromTo {y:80,opacity:0,scale:0.96} → {y:0,opacity:1,scale:1, back.out(1.4)}`. Inside: CODE chip (`tracking-[0.18em]`) + refresh + 6 boxes (`w-[52px] h-[56px] rounded-2xl border-2 overflow-hidden`).
- Per-box GSAP loader: `loaderRefs[i]` is an absolute gradient `linear-gradient(90deg, transparent, rgba(16,185,129,0.95) 50%, transparent)` at `xPercent:-100 opacity:0`; on digit entry `gsap.set → gsap.to {xPercent:100, duration:0.55, ease:power2.inOut, onComplete: set opacity 0}` plus border flash `borderColor rgba(16,185,129,0.9)→0.25`.
- Auto-advance focus, Backspace/Arrow handling, paste of 6 digits (`handlePaste`).
- On 6-digit complete: if `combined===captchaCode` → stagger green sweeps `delay i*0.04 duration 0.45` on all loaders, pill pulse `scale 1.02 yoyo`, then `performSignup(pendingSignup)` after 420ms. If mismatch → `captchaError` red text, pill shake `x:-8 duration 0.07 repeat 5 yoyo`, boxes red border flash, clear inputs after 700ms.
- `performSignup` reserves red for real errors — verification `needsVerification` case now sets `info` (green/emerald popup at `fixed top-6 left-1/2`) via `<AnimatePresence>` + `m.div`, not `error`. Login path unchanged (no captcha).

References: `references/auth-neon-human-check.md`

Author: auto-generated from debugging session