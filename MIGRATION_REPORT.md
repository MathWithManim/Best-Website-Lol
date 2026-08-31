# MIGRATION_REPORT.md

## 1. Files Created / Updated

### Created
- `MIGRATION_SPEC.md`
- `MIGRATION_REPORT.md` (this file)
- `src/db/auth-schema.ts`
- `src/lib/auth.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/actions/users.ts`
- `src/actions/game.ts`
- `src/actions/admin.ts`
- `src/actions/shop.ts`

### Updated
- `package.json` — added `@better-auth/drizzle-adapter`, `dotenv`
- `.env` — added `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `drizzle.config.ts` — already configured for Neon PostgreSQL
- `src/db/schema.ts` — added foreign-key references, indexes, auth tables

## 2. Function Mapping (Convex → New Endpoint / Action)

| Old Convex Function | New Server Action / Endpoint |
|---|---|
| `users.getAppUser()` | `src/actions/users.ts` (`getAppUser`) |
| `users.getIdentityEmail()` | `src/actions/users.ts` (`getIdentityEmail`) |
| `users.getRarityCounts()` | `src/actions/users.ts` (`getRarityCounts`) |
| `users.getLuckBucks()` | `src/actions/users.ts` (`getLuckBucks`) |
| `users.prestige()` | `src/actions/users.ts` (`prestige`) |
| `users.sellBulkJunk()` | `src/actions/users.ts` (`sellBulkJunk`) |
| `stats.getRarityStats()` | `src/actions/users.ts` (`getRarityStats`) |
| `stats.getTotalRolls()` | `src/actions/users.ts` (`getTotalRolls`) |
| `leaderboard.getWeeklyLeaderboard()` | `src/actions/users.ts` (`getWeeklyLeaderboard`) |
| `leaderboard.getRecentWins()` | `src/actions/users.ts` (`getRecentWins`) |
| `shop.getCosmetics()` | `src/actions/users.ts` (`getCosmetics`) |
| `shop.getActiveBoost()` | `src/actions/users.ts` (`getActiveBoost`) |
| `shop.getUserCosmetics()` | `src/actions/users.ts` (`getUserCosmetics`) |
| `shop.buySingleLuckBoost()` | `src/actions/users.ts` (`buySingleLuckBoost`) |
| `shop.buyMinuteBoost()` | `src/actions/users.ts` (`buyMinuteBoost`) |
| `shop.buyCosmetic()` | `src/actions/users.ts` (`buyCosmetic`) |
| `shop.equipCosmetic()` | `src/actions/users.ts` (`equipCosmetic`) |
| `rng.sellRarity()` | `src/actions/users.ts` (`sellRarity`) |
| `game.roll()` | `src/actions/game.ts` (`rollAction`) |
| Auth (`ctx.auth.getUserIdentity()`) | `src/lib/auth.ts` (Better Auth session) + `src/app/api/auth/[...all]/route.ts` |
| `listUsers` / `updateUserStats` / `deleteUser` | `src/actions/admin.ts` |

## 3. Features Requiring Frontend Adjustment

- `useQuery` / `useMutation` from Convex are replaced by direct server-action calls or `auth.api.getSession()` for auth checks.
- Real-time live subscriptions (`useQuery`) are no longer available; the frontend must either poll server actions or rely on page reloads for updated data.
- `ctx.storage` (Convex file storage) has no direct equivalent; use external storage (e.g., S3, Cloudflare R2) or database `text` fields.
- The `ConvexClientProvider` in `src/components/app/ConvexClientProvider.tsx` should be removed or replaced with a standard React context that does not rely on Convex.
