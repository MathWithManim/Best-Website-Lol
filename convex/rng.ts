import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const RARITIES = [
  "Common", "Uncommon", "Rare", "Legendary", "Mythical", "Divine", "Prismatic", 
  "Transcendent", "Epic", "Unique", "Heroic", "Fabled", "Ancient", "Ethereal", 
  "Celestial", "Astral", "Galactic", "Infinite", "Void", "Chaos", "Order", 
  "Reality", "Existence", "Infinity", "Beyond", "Absolute", "Final", "Omega", 
  "Alpha", "Zenith"
];

const WEIGHTS = [500000, 250000, 125000, 62500, 31250, 15625, 7812, 3906, 1953, 976, 488, 244, 122, 61, 30, 15, 7, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

export const roll = mutation({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email;
    if (email) {
      const lastRoll = await ctx.db
        .query("leaderboard")
        .withIndex("by_email", (q) => q.eq("email", email))
        .order("desc")
        .first();

      if (lastRoll && Date.now() - lastRoll.timestamp < 1000) {
        throw new Error("Rate limit exceeded: Please wait 1 second between rolls.");
      }
    }

    const totalWeight = WEIGHTS.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    let rarityName = RARITIES[RARITIES.length - 1];
    let rarityWeight = WEIGHTS[WEIGHTS.length - 1];

    for (let i = 0; i < RARITIES.length; i++) {
      currentWeight += WEIGHTS[i];
      if (random < currentWeight) {
        rarityName = RARITIES[i];
        rarityWeight = WEIGHTS[i];
        break;
      }
    }

    await ctx.db.insert("main_rng", {
      rarity: rarityName,
      timestamp: Date.now(),
    });

    if (email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (user) {
        await ctx.db.insert("leaderboard", {
          email: user.email,
          username: user.username || user.email.split("@")[0],
          rarity: rarityName,
          weight: rarityWeight,
          timestamp: Date.now(),
        });
      }
    }

    return rarityName;
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const rolls = await ctx.db.query("leaderboard").collect();
    rolls.sort((a, b) => a.weight - b.weight);
    return rolls.slice(0, 10);
  },
});
