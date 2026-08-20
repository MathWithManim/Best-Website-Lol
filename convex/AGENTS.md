# CONVEX BACKEND

Server functions: auth (Better Auth), RNG engine, shop, leaderboard, crons. **Always read `convex/_generated/ai/guidelines.md` first** — this codebase deviates from it in several places.

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Better Auth setup | `auth.ts` | `authComponent` + `createAuth` (email/password + convex + crossDomain plugins) |
| Auth JWT config | `auth.config.ts` | `getAuthConfigProvider()` — lets Convex validate Better Auth JWTs |
| Auth HTTP routes | `http.ts` | Better Auth endpoints on `/api/auth/*` via `registerRoutesLazy` + CORS |
| App user lookup | `users.ts` | `getAppUser(ctx)` (mutations), `getIdentityEmail(ctx)` (queries), `getCurrentUser`, admin `requireRoot` |
| RNG roll logic | `rng.ts` | `roll()`, `sellRarity()`, boost scaling, leaderboard-as-inventory |
| Shop/catalog | `shop.ts` | Hardcoded COSMETICS, `buyLuckBoost()`, `buyCosmetic()` |
| Leaderboard query | `leaderboard.ts` | `getLeaderboard()`, uses `by_weight` index with early termination |
| Shared constants | `shared.ts` | RARITIES, WEIGHTS, RARITY_VALUES — used by users.ts, rng.ts |
| Schema | `schema.ts` | 4 tables: users, leaderboard, user_cosmetics, global_stats (+ Better Auth component tables) |
| Cron jobs | `crons.ts` | 6h prune via `internal.rng.pruneAllLeaderboards` |
| Empty stub | `rls.ts` | 0 bytes — RLS never implemented |

## CONVENTIONS

- **Auth gate**: Authenticated functions use `ctx.auth.getUserIdentity()` (via `getIdentityEmail`/`getAppUser` from users.ts). NO sessionToken args — identity comes from the Better Auth JWT.
- **Lazy user rows**: `getAppUser(ctx)` (mutations only) finds the `users` row by email and creates it if missing — this links fresh Better Auth signups to existing legacy rows, preserving game data.
- **Helper typing**: Shared helpers use `ctx: { db: any }` with duck-typing (`if (ctx.db.insert)`) — not QueryCtx/MutationCtx
- **global_stats singleton**: One doc with `docId: "main"`, fetched via `.first()`
- **Cooldowns**: 1s roll (server `lastRollAt` + client localStorage), sell only server (`lastSellAt`)
- **Cron pattern**: `crons.interval(...)` with `internal.*` function refs (follows guidelines)

## ANTI-PATTERNS

1. **Leaderboard = Inventory**: `leaderboard` table doubles as per-user stock; `pruneUserLeaderboard` (keep 100) destroys sellable entries
2. **Vestigial auth fields**: `users.password`/`sessionToken`/`resetSecret` remain optional on the schema for legacy rows — Better Auth owns auth in its component tables; do not read or write them
3. **Hand-rolled rate limiting** (removed): was `login_attempts` table — Better Auth handles rate limiting now

## ENV VARS (deployment)

- `SITE_URL` — the web app origin (e.g. `http://localhost:5173` in dev). Used for trustedOrigins + crossDomain.
- `CONVEX_SITE_URL` — auto-set by Convex; used as `baseURL` for Better Auth.