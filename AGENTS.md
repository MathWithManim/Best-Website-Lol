# PROJECT KNOWLEDGE BASE

**Generated:** 2025-08-18
**Commit:** 401d45f
**Branch:** master

## OVERVIEW

React + Vite + TypeScript frontend with Convex backend. RNG game ("Jasper Sona") with rarity collection, shop, leaderboard, and cosmetic theming.

## STRUCTURE

```
website/
├── convex/           # Backend: auth, RNG engine, shop, leaderboard, crons
│   └── _generated/   # Auto-generated Convex API/types (DO NOT EDIT)
│       └── ai/       # Convex AI guidelines (READ FIRST for all convex/ work)
├── src/
│   ├── components/   # 25 React components (UI layer, state management)
│   ├── pages/        # 7 route-level pages (lazy-loaded)
│   └── lib/          # Utilities: cn() (unused), crypto.ts (rarity cache)
└── public/           # Static assets
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Auth (Better Auth) | `convex/auth.ts` + `src/lib/auth-client.ts` | Better Auth component on Convex; JWT validated via `convex/auth.config.ts` |
| App user lookup | `convex/users.ts` | `getAppUser()` / `getIdentityEmail()` from `ctx.auth.getUserIdentity()` |
| Modify RNG logic | `convex/rng.ts` | Roll engine, boost scaling, sell mechanics |
| Add shop item | `convex/shop.ts` | Hardcoded COSMETICS catalog |
| Change rarity data | `convex/shared.ts` + `src/lib/rarities.ts` | Backend + frontend shared constants |
| Add UI component | `src/components/` | Default export, `interface XxxProps` |
| Add new page | `src/pages/` + `src/App.tsx` | Lazy-load in App.tsx route table |
| Modify theme | `tailwind.config.js` + `src/index.css` | CSS vars overridden by CosmeticThemeProvider |
| Admin panel | `/x8f9a2_rootadmin` | Frontend gate on email + server `requireRoot` check |

## CODE MAP

| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|
| `authComponent` | Const | convex/auth.ts | http.ts | Better Auth Convex component client |
| `getAppUser()` | Helper | convex/users.ts | rng.ts, shop.ts | Resolve app user from JWT identity (mutations) |
| `getIdentityEmail()` | Helper | convex/users.ts | rng.ts, shop.ts | Resolve caller email from JWT identity (queries) |
| `requireRoot()` | Helper | convex/users.ts | listUsers, updateUserStats, deleteUser | Admin check (root@root.root) |
| `roll()` | Mutation | convex/rng.ts:29 | RNGGame | Main game roll |
| `sellRarity()` | Mutation | convex/rng.ts:116 | RarityStatsModal | Sell rarity for LB |
| `useUser()` | Hook | src/components/UserProvider.tsx | 5+ components | Auth context (backed by `useConvexAuth` + `getCurrentUser`) |
| `RARITY_COLORS` | Constant | src/lib/rarities.ts | RNGGame, RarityGrid, Leaderboard, ProfilePage | Rarity color map |
| `cn()` | Utility | src/lib/utils.ts | **0 (unused)** | clsx + tailwind-merge |

## CONVENTIONS

- **Convex first**: All server state via `useQuery`/`useMutation` with `"skip"` gate (never fetch without auth check)
- **Provider nesting**: ConvexClientProvider (ConvexBetterAuthProvider) → UserProvider → CosmeticThemeProvider → BrowserRouter
- **Component pattern**: Default export arrow function, local `interface XxxProps`, co-located constants
- **Dark mode**: Literal hex pairs `dark:bg-[#1a120b] dark:text-[#f4d5ad]` repeated per-element (no Tailwind theme extension for dark)
- **localStorage keys**: camelCase (`rarityData`, `lastRollTime`, `ownedCosmetics`) — auth state no longer in localStorage, comes from Better Auth sessions
- **Page convention**: Set `document.title = '... — Jasper Sona'` in useEffect, restore on unmount
- **Convex generated import**: All components import `api` via `../../convex/_generated/api`

## ANTI-PATTERNS (THIS PROJECT)

1. **Leaderboard ≠ inventory**: selling reads/writes `users.rarityCounts` only; the `leaderboard` table is an append-only score log with an 8-day TTL (`pruneAllLeaderboards` deletes older rows, always sparing the newest 8 for RecentWins). Never treat leaderboard rows as stock.
2. **Vestigial auth fields**: `users.password`/`sessionToken`/`resetSecret` remain on the schema (optional) for legacy rows — Better Auth owns auth in its component tables; do not read or write them.
3. **Hand-rolled rate limiting** (removed): was a `login_attempts` table with exponential backoff — Better Auth handles rate limiting now.

## COMMANDS

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npx convex dev     # Convex backend (separate terminal)
```

## NOTES

- `convex/rls.ts` is empty (0 bytes) — RLS never implemented
- `src/components/ui/` is empty — unused shadcn-style stub
- `src/lib/utils.ts` `cn()` is exported but never imported anywhere
- Convex `_generated/` is auto-generated; never edit manually
- The admin route `/x8f9a2_rootadmin` is obfuscated; server-enforced via `requireRoot` (email `root@root.root`)
- Existing legacy users must re-signup with the same email to keep game data — `getAppUser` links the new identity to the old `users` row by email

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
