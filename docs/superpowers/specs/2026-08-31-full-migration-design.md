# Full-Stack Migration Spec: Convex to Neon/Better Auth/Drizzle

## Overview
Rebuild the backend from Convex to a PostgreSQL/Neon-based architecture.
- **ORM**: Drizzle.
- **Auth**: Better Auth.
- **Frontend Data**: TanStack Query (replacing Convex `useQuery`/`useMutation`).

## Architecture
- **Database**: Neon (PostgreSQL).
- **Backend/API**: Cloudflare Pages Functions (REST/RPC).
- **Authentication**: Better Auth (integrated into Pages Functions).
- **Frontend State**: TanStack Query.

## Migration Steps
1. **Drizzle Mapping**: Define Drizzle schemas in `src/db/schema.ts` based on current Convex data.
2. **API Logic**: Implement business logic in `functions/api/` as REST endpoints.
3. **Frontend Data**: Replace all `useQuery`/`useMutation` with TanStack Query hooks.
4. **Auth Integration**: Protect endpoints using Better Auth middleware.

## Self-Review
- [ ] No placeholders.
- [ ] Boundaries clearly defined.
- [ ] TanStack Query strategy confirmed.

Please review this spec. If it looks good, I'll commit it and we'll create the implementation plan. 🐾
