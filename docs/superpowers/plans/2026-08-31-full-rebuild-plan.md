# Full-Stack Migration Plan: Convex → Neon + Better Auth + Drizzle

**Goal:** Migrate backend from Convex to Neon/Drizzle and integrate Better Auth.

**Architecture:** PostgreSQL (Neon) database via Drizzle ORM, Better Auth for auth, Cloudflare Pages for hosting.

**Spec:** `docs/superpowers/specs/2026-08-31-full-migration-design.md`

**Tech Stack:** Neon (PostgreSQL), Drizzle ORM, Better Auth, TanStack Query, React + Vite.

---

## Global Constraints
- Database: `postgresql://neondb_owner:npg_tP35eWiwmOJp@ep-silent-boat-az6ergbe-pooler.c-3.ap-southeast-1.aws.neon.tech/Jasper?sslmode=require&channel_binding=require`
- Auth: Better Auth with `emailAndPassword: { enabled: true }`
- Tables: `users`, `user_cosmetics`, `leaderboard`, `global_stats` (from `src/db/schema.ts`)
- Only actual backend/auth files committed; docs/design files not pushed.

---

### Task 1: Setup Drizzle Client and Schema Migration

**Files:**
- Create: `src/lib/db.ts` (Drizzle client)
- Modify: `src/db/schema.ts` (ensure Drizzle exports match current tables)

**Interfaces:**
- Consumes: None (first task)
- Produces: `db` client object for other tasks

- [ ] Write Drizzle client setup using `@neondatabase/serverless` or `pg` depending on environment.
- [ ] Verify `users`, `session`, `account`, `verification` schema from `src/db/schema.ts` is exported correctly.
- [ ] Test connection with `npm run dev` (but don't push).

---

### Task 2: Replace Auth Endpoint (`functions/api/auth`)

**Files:**
- Modify: `functions/api/auth/[[catchall]].ts`

**Interfaces:**
- Consumes: `db` from Task 1, Better Auth setup.
- Produces: `/api/auth` endpoint working with Neon DB.

- [ ] Confirm `getAuth()` uses the `neon()` adapter successfully (already applied: `const { Pool } = await import("@neondatabase/serverless");` and `neon(connectionString)`).
- [ ] Verify `authInstance` is initialized correctly with `database: neon(...)`.
- [ ] Test `/api/auth/sign-up/email` endpoint with a test `curl` call.

---

### Task 3: Migrate Game Backend Logic (RNG, Shop, Leaderboard)

**Files:**
- Create: `functions/api/game/roll.ts`
- Create: `functions/api/game/shop.ts`
- Modify: Any Convex references in `src/components/game/` (but don't fix frontend fully yet, just prepare backend endpoints).

**Interfaces:**
- Consumes: `db` from Task 1, `getAuth` from Task 2.
- Produces: Game API endpoints.

- [ ] Write `roll` mutation backend logic (reading `global_stats`, updating `users` rarity counts).
- [ ] Write `shop` mutation/sell logic.
- [ ] Ensure all endpoints return proper JSON (not broken `JSON.stringify` errors like `{"status":500,"statusText":""}`).
- [ ] Add error logging that doesn't corrupt JSON responses.

---

### Task 4: Migrate Frontend Data Layer (`useQuery` → TanStack Query)

**Files:**
- Modify: `src/components/app/UserProvider.tsx`
- Modify: `src/components/game/RNGGame.tsx`
- Modify: `src/components/game/Leaderboard.tsx`
- Modify: `src/components/Shop.tsx`
- Modify: `src/lib/auth-client.ts` (if needed)

**Interfaces:**
- Consumes: Backend endpoints from Tasks 2 and 3.
- Produces: Updated frontend using `useQuery` from TanStack Query.

- [ ] Replace Convex `useQuery` imports with TanStack Query equivalents.
- [ ] Update `authClient` interaction (`authClient.signUp.email`) to work with the new `/api/auth` endpoint.
- [ ] Ensure `localStorage` keys (`rarityData`, `lastRollTime`) remain consistent.
- [ ] Fix `verboseError` usage in `App.tsx` (pre-existing TypeScript error unrelated to auth).

---

### Task 5: Final Verification and Cleanup

**Files:**
- Modify: `tests/e2e.spec.ts` (update test expectations)
- Modify: `tests/repro_signup.spec.ts` (if kept, update assertions)

**Interfaces:**
- Consumes: Completed backend (Task 2) and frontend (Task 4).
- Produces: Passing E2E tests.

- [ ] Run `npm run build` and confirm TypeScript errors are reduced (Convex-related errors removed or replaced).
- [ ] Run `npx playwright test` with `headless` mode (not `--headed`) in the CI environment.
- [ ] Confirm account creation (`signUp`) returns 200 or proper JSON error, not `{"status":500,"statusText":""}`.

---

## Self-Review
- [x] No placeholders (all steps have actual code/file references).
- [x] Each task produces a testable deliverable.
- [x] Dependency order is correct: DB setup -> Auth -> Game Logic -> Frontend.
- [x] Only actual backend/auth files are addressed; design doc not pushed.
- [x] TanStack Query is mentioned as the replacement strategy for `useQuery`.

Please approve this plan (or tell me if you prefer `useEffect` over TanStack Query) before I proceed.
