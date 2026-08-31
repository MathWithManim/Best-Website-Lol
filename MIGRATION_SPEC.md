# MIGRATION_SPEC.md — Convex → Neon PostgreSQL + Drizzle ORM + Better Auth

## 1. Convex Directory Audit

### convex/ (Root)
- `convex/_generated/api.ts`: Dummy proxy/stub — no real Convex backend deployed.
- No `convex/schema.ts` found.
- No `convex/auth.config.ts` present in repo.
- `convex/auth.ts`, `convex/users.ts`, `convex/rng.ts`, `convex/shop.ts`, `convex/shared.ts`, `convex/crons.ts`, `convex/http.ts`, `convex/rls.ts` are referenced by AGENTS.md but not present in this workspace; they represent the conceptual backend that this frontend previously targeted.

### Source References to Convex Functions (from codebase scan)
The frontend references these conceptual Convex endpoints via `convex/_generated/api` stubs:

| Module | Function References (stubbed) |
|---|---|
| `src/components/app/UserProvider.tsx` | Convex auth identity check (`isAuthenticated`, `isLoading`) — replaced with Better Auth session |
| `src/components/RecentWins.tsx` | `api.leaderboard.getRecentWins` |
| `src/components/Shop.tsx` | `api.shop.getCosmetics`, `api.shop.getActiveBoost`, `api.shop.getUserCosmetics`, `api.shop.getLuckBucks`, `api.shop.buySingleLuckBoost`, `api.shop.buyMinuteBoost`, `api.shop.buyCosmetic`, `api.shop.equipCosmetic` |
| `src/components/game/Leaderboard.tsx` | `api.leaderboard.getWeeklyLeaderboard` |
| `src/components/game/RNGSection.tsx` | `api.users.getRarityCounts`, `api.users.getLuckBucks`, `api.users.prestige`, `api.users.sellBulkJunk`, `api.stats.getRarityStats`, `api.stats.getTotalRolls` |
| `src/components/game/RNGGame.tsx` | Roll logic (server roll) — already uses `localRoll()` fallback |
| `src/components/game/RarityStatsModal.tsx` | `api.rng.sellRarity` |

### Tables Referenced (from AGENTS.md / code comments)
- `users` (Convex schema `users`) — mapped to `users` PostgreSQL table
- `leaderboard` — mapped to `leaderboard` PostgreSQL table
- `user_cosmetics` / cosmetics catalog — mapped via `user_cosmetics` + `global_stats`

### Auth Checks
- `ctx.auth.getUserIdentity()` used in Convex mutations/queries — replaced with `const session = await auth.api.getSession({ headers: await headers() })`
- `requireRoot()` (admin check for `root@root.root`) — preserved in server actions

### Custom Errors / Business Logic (preserved verbatim)
- Rate-limit / cooldown logic (`ROLL_COOLDOWN_MS`, `MIN_SPIN_MS`)
- Rarity calculation (`localRoll()`, `RARITY_COLORS`, `RARITY_VALUES`)
- Cosmetic ownership checks
- Bulk junk selling logic
- Prestige/rebirth calculations
- Leaderboard pruning (8-day TTL via `pruneAllLeaderboards` cron concept)

### Indexes / Constraints
- `users.email` unique
- `leaderboard.user_email`
- `global_stats.doc_id`
- `user_cosmetics.user_email` + `cosmetic_id`

## 2. Migration Approach
Every Convex query/mutation/action is translated to a server-side function or server action under `functions/` or `src/actions/` using Drizzle ORM (`db.select()`, `db.insert()`, `db.update()`, `db.delete()`), with Better Auth session validation.
