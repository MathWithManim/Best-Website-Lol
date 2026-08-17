import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Security event logging & account lockout management
export const logSecurityEvent = mutation({
  args: { eventType: v.string(), details: v.string(), ip: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.insert("security_logs", {
      eventType: args.eventType,
      details: args.details,
      ip: args.ip || "unknown",
      timestamp: Date.now(),
    });
  },
});

// Check if account is locked (10 min lockout after failed logins)
export const checkLockout = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("account_locks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!record) return { locked: false };

    const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes
    if (record.lockedUntil > Date.now()) {
      return { locked: true, remaining: record.lockedUntil - Date.now(), duration: LOCKOUT_DURATION };
    }
    return { locked: false };
  },
});

// Handle failed login attempt & trigger 10 min lockout if >= 5 failures
export const recordFailedLogin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("account_locks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("account_locks", {
        email: args.email,
        failures: 1,
        lockedUntil: 0,
      });
    } else {
      const newFailures = existing.failures + 1;
      const lockedUntil = newFailures >= 5 ? now + 10 * 60 * 1000 : 0;
      await ctx.db.patch(existing._id, {
        failures: newFailures,
        lockedUntil,
      });
    }
  },
});
