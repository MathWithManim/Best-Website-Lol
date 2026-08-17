import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leaderboard: defineTable({
    email: v.string(),
    username: v.string(),
    rarity: v.string(),
    weight: v.number(),
    timestamp: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_rarity", ["rarity"])
    .index("by_weight", ["weight"]),
  users: defineTable({
    email: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    pfp: v.optional(v.string()),
    password: v.string(),
    createdAt: v.number(),
    luckbucks: v.optional(v.number()),
    activeLuckBoost: v.optional(v.object({
      multiplier: v.number(),
      expiresAt: v.number(),
      rollsLeft: v.number(),
    })),
    equippedCosmetic: v.optional(v.string()),
    rarityCounts: v.optional(v.record(v.string(), v.number())),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),
  user_cosmetics: defineTable({
    email: v.string(),
    cosmeticId: v.string(),
    purchasedAt: v.number(),
  }).index("by_email", ["email"]),
  global_stats: defineTable({
    docId: v.string(),
    counts: v.record(v.string(), v.number()),
    totalRolls: v.number(),
  }),
});
