import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record roll on leaderboard
export const recordRoll = mutation({
  args: { email: v.string(), username: v.string(), rarity: v.string(), weight: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("leaderboard", {
      email: args.email,
      username: args.username,
      rarity: args.rarity,
      weight: args.weight,
      timestamp: Date.now(),
    });
  },
});

// Get top rolls leaderboard
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // Return top 10 rarest rolls sorted by lowest weight (or highest rarity weight)
    const rolls = await ctx.db.query("leaderboard").order("desc").collect();
    // Sort by weight ascending (smaller weight = rarer)
    rolls.sort((a, b) => a.weight - b.weight);
    return rolls.slice(0, 10);
  },
});
