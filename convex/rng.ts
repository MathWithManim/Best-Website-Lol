import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { authenticate } from "./users";

const RARITIES = [
  "Common", "Uncommon", "Rare", "Legendary", "Mythical", "Divine", "Prismatic",
  "Transcendent", "Epic", "Unique", "Heroic", "Fabled", "Ancient", "Ethereal",
  "Celestial", "Astral", "Galactic", "Infinite", "Void", "Chaos", "Order",
  "Reality", "Existence", "Infinity", "Beyond", "Absolute", "Final", "Omega",
  "Alpha", "Zenith"
];

const WEIGHTS = [500000, 250000, 125000, 62500, 31250, 15625, 7812, 3906, 1953, 976, 488, 244, 122, 61, 30, 15, 7, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

export const RARITY_VALUES = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 100000];

/** Get or create the global stats singleton */
async function getOrCreateGlobalStats(ctx: { db: any }) {
  const existing = await ctx.db.query("global_stats").first();
  if (existing) return existing;

  const counts: Record<string, number> = {};
  for (const r of RARITIES) counts[r] = 0;
  const _id = await ctx.db.insert("global_stats", {
    docId: "main",
    counts,
    totalRolls: 0,
  });
  return await ctx.db.get(_id);
}

/** Cap leaderboard entries per user — keeps only the most recent `limit` entries. */
async function pruneUserLeaderboard(ctx: { db: any }, email: string, limit = 100) {
  const entries = await ctx.db
    .query("leaderboard")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .order("desc")
    .take(limit + 50);

  if (entries.length > limit) {
    const toDelete = entries.slice(limit);
    for (const entry of toDelete) {
      await ctx.db.delete(entry._id);
    }
  }
}

export const roll = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

    // 1-second cooldown between rolls
    const now = Date.now();
    const lastRollAt = (user as any).lastRollAt || 0;
    if (now - lastRollAt < 1000) {
      throw new Error("Please wait before rolling again");
    }

    let weights = [...WEIGHTS];
    let boostApplied = false;

    // Check for active luck boost
    if (user.activeLuckBoost && user.activeLuckBoost.expiresAt > now && user.activeLuckBoost.rollsLeft > 0) {
      const multiplier = user.activeLuckBoost.multiplier;
      weights = weights.map((w, i) =>
        Math.round(w * (1 + (multiplier - 1) * (i / (RARITIES.length - 1))))
      );
      boostApplied = true;

      const newRollsLeft = user.activeLuckBoost.rollsLeft - 1;
      if (newRollsLeft <= 0) {
        await ctx.db.patch(user._id, { activeLuckBoost: undefined });
      } else {
        await ctx.db.patch(user._id, {
          activeLuckBoost: { ...user.activeLuckBoost, rollsLeft: newRollsLeft }
        });
      }
    } else if (user.activeLuckBoost && user.activeLuckBoost.expiresAt <= now) {
      await ctx.db.patch(user._id, { activeLuckBoost: undefined });
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

    // Update global stats
    const stats = await getOrCreateGlobalStats(ctx);
    const newCounts = { ...stats.counts };
    newCounts[rarityName] = (newCounts[rarityName] || 0) + 1;
    await ctx.db.patch(stats._id, { counts: newCounts, totalRolls: stats.totalRolls + 1 });

    // Insert into leaderboard
    await ctx.db.insert("leaderboard", {
      email: user.email,
      username: user.username || user.email.split("@")[0],
      rarity: rarityName,
      weight: rarityWeight,
      timestamp: now,
    });

    // Update per-user rarity counts
    const counts = { ...(user.rarityCounts || {}) };
    counts[rarityName] = (counts[rarityName] || 0) + 1;
    await ctx.db.patch(user._id, { rarityCounts: counts, lastRollAt: now });

    // Prune old leaderboard entries (keep last 100 per user)
    await pruneUserLeaderboard(ctx, user.email, 100);

    return { rarity: rarityName, boostApplied };
  },
});

// Get rarity counts for a user — requires authentication
export const getUserRarityCounts = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);
    return user.rarityCounts || {};
  },
});

// Sell rarities for LuckBucks — requires authentication
export const sellRarity = mutation({
  args: {
    sessionToken: v.string(),
    rarity: v.string(),
    amount: v.number(), // 1, 10, or -1 for all
  },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

    // 1-second cooldown between sells
    const now = Date.now();
    const lastSellAt = (user as any).lastSellAt || 0;
    if (now - lastSellAt < 1000) {
      throw new Error("Please wait before selling again");
    }

    const rolls = await ctx.db
      .query("leaderboard")
      .withIndex("by_email", (q: any) => q.eq("email", user.email))
      .take(50000);

    const rarityRolls = rolls.filter((r: any) => r.rarity === args.rarity);
    const count = rarityRolls.length;

    if (count === 0) throw new Error("You don't have any of this rarity");

    const VALID_AMOUNTS = [1, 10, -1];
    if (!Number.isInteger(args.amount) || !VALID_AMOUNTS.includes(args.amount)) {
      throw new Error("Invalid sell amount. Must be 1, 10, or -1 (all).");
    }

    const sellAmount = args.amount === -1 ? count : Math.min(args.amount, count);

    const rarityIndex = RARITIES.indexOf(args.rarity);
    const valuePerItem = rarityIndex >= 0 ? RARITY_VALUES[rarityIndex] : 1;
    const totalLB = sellAmount * valuePerItem;

    // Delete the sold leaderboard entries
    const toDelete = rarityRolls.slice(0, sellAmount);
    for (const entry of toDelete) {
      await ctx.db.delete(entry._id);
    }

    // Decrement per-user rarity counts
    const counts = { ...(user.rarityCounts || {}) };
    counts[args.rarity] = Math.max(0, (counts[args.rarity] || 0) - sellAmount);
    if (counts[args.rarity] === 0) delete counts[args.rarity];
    await ctx.db.patch(user._id, {
      luckbucks: (user.luckbucks || 0) + totalLB,
      rarityCounts: counts,
      lastSellAt: now,
    });

    // Decrement global stats
    const stats = await getOrCreateGlobalStats(ctx);
    const newCounts = { ...stats.counts };
    newCounts[args.rarity] = Math.max(0, (newCounts[args.rarity] || 0) - sellAmount);
    await ctx.db.patch(stats._id, { counts: newCounts, totalRolls: Math.max(0, stats.totalRolls - sellAmount) });

    return {
      sold: sellAmount,
      earned: totalLB,
      newBalance: (user.luckbucks || 0) + totalLB,
      remaining: count - sellAmount,
    };
  },
});

// Get stats for each rarity — reads from global_stats singleton, O(1)
export const getRarityStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = await getOrCreateGlobalStats(ctx);
    const totalWeight = WEIGHTS.reduce((sum, w) => sum + w, 0);

    return RARITIES.map((rarity, i) => ({
      rarity,
      index: i,
      count: stats.counts[rarity] || 0,
      uniqueUsers: 0,
      chance: (WEIGHTS[i] / totalWeight) * 100,
    }));
  },
});

// --- Internal mutation for cron cleanup ---
export const pruneAllLeaderboards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(200);
    let totalPruned = 0;

    for (const user of users) {
      if (!user.email) continue;
      const entries = await ctx.db
        .query("leaderboard")
        .withIndex("by_email", (q: any) => q.eq("email", user.email))
        .order("desc")
        .take(150);

      if (entries.length > 100) {
        const toDelete = entries.slice(100);
        for (const entry of toDelete) {
          await ctx.db.delete(entry._id);
          totalPruned++;
        }
      }
    }

    return { usersProcessed: users.length, entriesPruned: totalPruned };
  },
});
