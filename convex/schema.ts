import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leaderboard: defineTable({
    email: v.string(),
    username: v.string(),
    rarity: v.string(),
    rebirthCount: v.number(),
    weight: v.number(),
    timestamp: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_rarity", ["rarity"])
    .index("by_weight", ["weight"])
    .index("by_timestamp", ["timestamp"]),
  users: defineTable({
    email: v.string(),
    username: v.optional(v.string()),
    usernameLower: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    pfp: v.optional(v.string()),
    createdAt: v.number(),
    luckbucks: v.optional(v.number()),
    activeLuckBoost: v.optional(v.object({
      multiplier: v.number(),
      expiresAt: v.number(),
      rollsLeft: v.number(),
    })),
    equippedCosmetic: v.optional(v.string()),
    rarityCounts: v.optional(v.record(v.string(), v.number())),
    discovered: v.optional(v.record(v.string(), v.boolean())),
    lastSellAt: v.optional(v.number()),
    lastRollAt: v.optional(v.number()),
    hiloCard: v.optional(v.number()),
    // Rebirth / progression
    rebirthCount: v.optional(v.number()),
    rollCount: v.optional(v.number()),
    completedGame: v.optional(v.boolean()),
    prestigeCount: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_usernameLower", ["usernameLower"]),
  user_cosmetics: defineTable({
    email: v.string(),
    cosmeticId: v.string(),
    purchasedAt: v.number(),
  }).index("by_email", ["email"]),
  global_stats: defineTable({
    docId: v.string(),
    counts: v.record(v.string(), v.number()),
    totalRolls: v.number(),
    uniqueUsers: v.optional(v.record(v.string(), v.number())),
  }).index("by_docId", ["docId"]),
  admin_audit: defineTable({
    adminEmail: v.string(),
    action: v.string(),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
