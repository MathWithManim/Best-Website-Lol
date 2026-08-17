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

export const RARITY_VALUES = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 100000];

export const roll = mutation({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email;
    let weights = [...WEIGHTS];
    let boostApplied = false;

    // Check for active luck boost
    if (email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (user?.activeLuckBoost && user.activeLuckBoost.expiresAt > Date.now() && user.activeLuckBoost.rollsLeft > 0) {
        const multiplier = user.activeLuckBoost.multiplier;
        // Rarer items get a proportionally bigger boost
        weights = weights.map((w, i) =>
          Math.round(w * (1 + (multiplier - 1) * (i / (RARITIES.length - 1))))
        );
        boostApplied = true;

        // Decrement rollsLeft or clear boost
        const newRollsLeft = user.activeLuckBoost.rollsLeft - 1;
        if (newRollsLeft <= 0) {
          await ctx.db.patch(user._id, { activeLuckBoost: undefined });
        } else {
          await ctx.db.patch(user._id, {
            activeLuckBoost: { ...user.activeLuckBoost, rollsLeft: newRollsLeft }
          });
        }
      } else if (user?.activeLuckBoost && user.activeLuckBoost.expiresAt <= Date.now()) {
        await ctx.db.patch(user._id, { activeLuckBoost: undefined });
      }
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    let rarityName = RARITIES[RARITIES.length - 1];
    let rarityWeight = weights[weights.length - 1];

    for (let i = 0; i < RARITIES.length; i++) {
      currentWeight += weights[i];
      if (random < currentWeight) {
        rarityName = RARITIES[i];
        rarityWeight = weights[i];
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

      await ctx.db.insert("leaderboard", {
        email: email,
        username: user?.username || email.split("@")[0],
        rarity: rarityName,
        weight: rarityWeight,
        timestamp: Date.now(),
      });
    }

    return { rarity: rarityName, boostApplied };
  },
});

// Get rarity counts for a user (for grid display)
export const getUserRarityCounts = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const rolls = await ctx.db
      .query("leaderboard")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .take(50000);

    const counts: Record<string, number> = {};
    for (const roll of rolls) {
      counts[roll.rarity] = (counts[roll.rarity] || 0) + 1;
    }
    return counts;
  },
});

// Sell rarities for LuckBucks
export const sellRarity = mutation({
  args: {
    email: v.string(),
    rarity: v.string(),
    amount: v.number(), // 1, 10, or -1 for all
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    const rolls = await ctx.db
      .query("leaderboard")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .take(50000);

    const rarityRolls = rolls.filter(r => r.rarity === args.rarity);
    const count = rarityRolls.length;

    if (count === 0) throw new Error("You don't have any of this rarity");

    const sellAmount = args.amount === -1 ? count : Math.min(args.amount, count);

    const rarityIndex = RARITIES.indexOf(args.rarity);
    const valuePerItem = rarityIndex >= 0 ? RARITY_VALUES[rarityIndex] : 1;
    const totalLB = sellAmount * valuePerItem;

    // Delete the sold entries
    const toDelete = rarityRolls.slice(0, sellAmount);
    for (const entry of toDelete) {
      await ctx.db.delete(entry._id);
    }

    const currentLB = user.luckbucks || 0;
    await ctx.db.patch(user._id, { luckbucks: currentLB + totalLB });

    return {
      sold: sellAmount,
      earned: totalLB,
      newBalance: currentLB + totalLB,
      remaining: count - sellAmount,
    };
  },
});

// Get stats for each rarity
export const getRarityStats = query({
  args: {},
  handler: async (ctx) => {
    const allRolls = await ctx.db.query("leaderboard").take(50000);
    const totalWeight = WEIGHTS.reduce((sum, w) => sum + w, 0);

    return RARITIES.map((rarity, i) => {
      const rarityRolls = allRolls.filter(r => r.rarity === rarity);
      const uniqueUsers = new Set(rarityRolls.map(r => r.email)).size;
      return {
        rarity,
        index: i,
        count: rarityRolls.length,
        uniqueUsers,
        chance: (WEIGHTS[i] / totalWeight) * 100,
      };
    });
  },
});
