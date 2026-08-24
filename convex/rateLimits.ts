import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

// Authoritative server-side throttle for economy mutations. The client-side
// cooldowns and lastRollAt/lastSellAt timestamps remain, but concurrent
// requests can bypass those reads — this cannot be bypassed.
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  roll: { kind: "token bucket", rate: 1, period: 1_000, capacity: 2 },
  sell: { kind: "token bucket", rate: 1, period: 1_000, capacity: 2 },
  buy: { kind: "token bucket", rate: 2, period: 1_000, capacity: 4 },
  prestige: { kind: "fixed window", rate: 1, period: 60_000, capacity: 1 },
  rebirth: { kind: "fixed window", rate: 1, period: 60_000, capacity: 2 },
  arcade: { kind: "token bucket", rate: 2, period: 1_000, capacity: 3 },
});
