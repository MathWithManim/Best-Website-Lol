import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  test: defineTable({
    val: v.string(),
  }),
  main_rng: defineTable({
    rarity: v.string(),
    timestamp: v.number(),
  }),
  leaderboard: defineTable({
    email: v.string(),
    username: v.string(),
    rarity: v.string(),
    weight: v.number(),
    timestamp: v.number(),
  }).index("by_email", ["email"]),
  users: defineTable({
    email: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    pfp: v.optional(v.string()),
    password: v.string(), // plain text as requested
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  account_locks: defineTable({
    email: v.string(),
    failures: v.number(),
    lockedUntil: v.number(),
  }).index("by_email", ["email"]),
  security_logs: defineTable({
    eventType: v.string(),
    details: v.string(),
    ip: v.string(),
    timestamp: v.number(),
  }),
});
