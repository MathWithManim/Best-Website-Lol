import { mutation, query, internalMutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAppUser, getIdentityEmail } from "./users";
import {
  RARITIES,
  WEIGHTS,
  RARITY_VALUES,
  rollCostFor,
  totalRaritiesFor,
  RARITIES_PER_REBIRTH,
  MAX_REBIRTHS,
  TOTAL_RARITIES,
  computeBulkSale,
  LEADERBOARD_MIN_VALUE,
  prestigeMultiplier,
} from "./shared";

/** Get or create the global stats singleton (mutations only) */
async function getOrCreateGlobalStats(ctx: MutationCtx) {
  const existing = await ctx.db
    .query("global_stats")
    .withIndex("by_docId", (q) => q.eq("docId", "main"))
    .first();
  if (existing) return existing;

  const counts: Record<string, number> = {};
  for (const r of RARITIES) counts[r] = 0;

  const _id = await ctx.db.insert("global_stats", {
    docId: "main",
    counts,
    totalRolls: 0,
    uniqueUsers: {},
  });
  const created = await ctx.db.get(_id);
  if (!created) throw new Error("Failed to create global stats");
  return created;
}

export const roll = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const user = await getAppUser(ctx);

    if (user.completedGame) {
      throw new Error("You have completed the game. There is nothing left.");
    }

    // 1-second cooldown between rolls
    const now = Date.now();
    const lastRollAt = user.lastRollAt || 0;
    if (now - lastRollAt < 1000) {
      throw new Error("Please wait before rolling again");
    }

    // Roll cost: first roll free, then ladder cycles 1(x10), 2(x5), 4(x3), 8(x1)
    const rollCount = user.rollCount || 0;
    const cost = rollCostFor(rollCount);
    const luckbucks = user.luckbucks || 0;
    if (luckbucks < cost) {
      throw new Error(`Not enough LuckBucks (need ${cost})`);
    }

    const unlocked = totalRaritiesFor(user.rebirthCount || 0);

    let weights = [...WEIGHTS].slice(0, unlocked);
    let boostApplied = false;

    // Check for active luck boost
    if (user.activeLuckBoost && user.activeLuckBoost.expiresAt > now && user.activeLuckBoost.rollsLeft > 0) {
      const multiplier = user.activeLuckBoost.multiplier;
      weights = weights.map((w, i) =>
        Math.round(w * (1 + (multiplier - 1) * (i / (unlocked - 1))))
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
    let rarityName = RARITIES[unlocked - 1];
    let rarityWeight = weights[unlocked - 1];

    for (let i = 0; i < unlocked; i++) {
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
    const isFirstCatch = !(user.rarityCounts && user.rarityCounts[rarityName] > 0);
    const patch: {
      counts: Record<string, number>;
      totalRolls: number;
      uniqueUsers?: Record<string, number>;
    } = { counts: newCounts, totalRolls: stats.totalRolls + 1 };
    if (isFirstCatch) {
      const newUnique = { ...(stats.uniqueUsers || {}) };
      newUnique[rarityName] = (newUnique[rarityName] || 0) + 1;
      patch.uniqueUsers = newUnique;
    }
    await ctx.db.patch(stats._id, patch);

    const rarityIndex = RARITIES.indexOf(rarityName);
    if ((RARITY_VALUES[rarityIndex] ?? 0) >= LEADERBOARD_MIN_VALUE) {
      await ctx.db.insert("leaderboard", {
        email: user.email,
        username: user.username || user.email.split("@")[0],
        rarity: rarityName,
        rebirthCount: user.rebirthCount || 0,
        weight: rarityWeight,
        timestamp: now,
      });
    }

    // Update per-user rarity counts (this is the real inventory)
    const counts = { ...(user.rarityCounts || {}) };
    counts[rarityName] = (counts[rarityName] || 0) + 1;
    const discovered = { ...(user.discovered || {}) };
    discovered[rarityName] = true;
    const distinctCaught = Object.keys(counts).length;
    const nextRollCount = rollCount + 1;
    const completedGame = distinctCaught >= TOTAL_RARITIES;
    await ctx.db.patch(user._id, {
      rarityCounts: counts,
      discovered,
      lastRollAt: now,
      luckbucks: luckbucks - cost,
      rollCount: nextRollCount,
      ...(completedGame && { completedGame: true }),
    });

    return { rarity: rarityName, boostApplied, cost, completedGame };
  },
});

// Get rarity counts for a user — requires authentication
export const getUserRarityCounts = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const email = await getIdentityEmail(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    return user?.rarityCounts || {};
  },
});

// Sell rarities for LuckBucks — requires authentication
export const sellRarity = mutation({
  args: {
    rarity: v.string(),
    amount: v.number(), // 1, 10, or -1 for all
  },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);

    // 1-second cooldown between sells
    const now = Date.now();
    const lastSellAt = user.lastSellAt || 0;
    if (now - lastSellAt < 1000) {
      throw new Error("Please wait before selling again");
    }

    const count = user.rarityCounts?.[args.rarity] || 0;
    if (count === 0) throw new Error("You don't have any of this rarity");

    const VALID_AMOUNTS = [1, 10, -1];
    if (!Number.isInteger(args.amount) || !VALID_AMOUNTS.includes(args.amount)) {
      throw new Error("Invalid sell amount. Must be 1, 10, or -1 (all).");
    }

    const sellAmount = args.amount === -1 ? count : Math.min(args.amount, count);

    const rarityIndex = RARITIES.indexOf(args.rarity);
    const valuePerItem = rarityIndex >= 0 ? RARITY_VALUES[rarityIndex] : 1;
    const totalLB = Math.round(sellAmount * valuePerItem * prestigeMultiplier(user.prestigeCount || 0));

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
    await ctx.db.patch(stats._id, { counts: newCounts });

    return {
      sold: sellAmount,
      earned: totalLB,
      newBalance: (user.luckbucks || 0) + totalLB,
      remaining: count - sellAmount,
    };
  },
});

// Rebirth: requires 10 distinct rarities caught per rebirth tier. Each rebirth
// unlocks 10 more rarities at the end of the roster (up to 500 total).
export const rebirth = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const user = await getAppUser(ctx);

    if (user.completedGame) {
      throw new Error("You have completed the game. There is nothing left.");
    }

    const rebirthCount = user.rebirthCount || 0;
    if (rebirthCount >= MAX_REBIRTHS) {
      throw new Error("Maximum rebirths reached");
    }

    const distinctCaught = Object.keys(user.rarityCounts || {}).length;
    const required = (rebirthCount + 1) * RARITIES_PER_REBIRTH;
    if (distinctCaught < required) {
      throw new Error(`Rebirth requires ${required} distinct rarities (you have ${distinctCaught})`);
    }

    const newRebirthCount = rebirthCount + 1;
    const unlocked = totalRaritiesFor(newRebirthCount);
    const completedGame = unlocked >= TOTAL_RARITIES && distinctCaught >= TOTAL_RARITIES;
    await ctx.db.patch(user._id, {
      rebirthCount: newRebirthCount,
      ...(completedGame && { completedGame: true }),
    });

    return { rebirthCount: newRebirthCount, totalRarities: unlocked, completedGame };
  },
});

// Get stats for each rarity — reads from global_stats singleton, O(1)
export const getRarityStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("global_stats")
      .withIndex("by_docId", (q) => q.eq("docId", "main"))
      .first();
    const counts = stats?.counts || {};
    const uniqueUsers = stats?.uniqueUsers || {};
    const totalWeight = WEIGHTS.reduce((sum, w) => sum + w, 0);

    return RARITIES.map((rarity, i) => ({
      rarity,
      index: i,
      count: counts[rarity] || 0,
      uniqueUsers: uniqueUsers[rarity] || 0,
      chance: (WEIGHTS[i] / totalWeight) * 100,
    }));
  },
});

// TTL'd score log (inventory = users.rarityCounts). Consumers:
// getWeeklyLeaderboard reads a 7-day window (< this TTL); getRecentWins reads
// the newest 8 rows, which are kept below even past the TTL.
export const pruneAllLeaderboards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 8 * 24 * 60 * 60 * 1000;

    const keep = new Set<Id<"leaderboard">>();
    for (const entry of await ctx.db.query("leaderboard").withIndex("by_timestamp").order("desc").take(8)) {
      keep.add(entry._id);
    }

    let pruned = 0;
    for await (const entry of ctx.db.query("leaderboard").withIndex("by_timestamp", (q) =>
      q.lt("timestamp", cutoff)
    )) {
      if (!keep.has(entry._id)) {
        await ctx.db.delete(entry._id);
        pruned += 1;
      }
    }
    return { entriesPruned: pruned };
  },
});

export const sellBulkJunk = mutation({
  args: { maxSellValue: v.number() },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);

    if (!Number.isInteger(args.maxSellValue) || args.maxSellValue < 1 || args.maxSellValue > 100) {
      throw new Error("maxSellValue must be an integer between 1 and 100");
    }

    if (Date.now() - (user.lastSellAt || 0) < 1000) {
      throw new Error("Please wait before selling again");
    }

    const counts = user.rarityCounts || {};
    if (Object.keys(counts).length === 0) throw new Error("Nothing to sell");

    const sale = computeBulkSale(counts, args.maxSellValue);
    const earned = Math.round(sale.earned * prestigeMultiplier(user.prestigeCount || 0));
    const itemsSold = sale.itemsSold;
    const remainingCounts = sale.remainingCounts;
    if (itemsSold === 0) throw new Error(`No rarities worth ${args.maxSellValue} LB or less`);

    await ctx.db.patch(user._id, {
      luckbucks: (user.luckbucks || 0) + earned,
      rarityCounts: remainingCounts,
      lastSellAt: Date.now(),
    });

    const stats = await ctx.db
      .query("global_stats")
      .withIndex("by_docId", (q) => q.eq("docId", "main"))
      .first();
    if (stats) {
      const globalCounts = { ...stats.counts };
      for (const [rarity] of Object.entries(counts)) {
        const soldHere = (counts[rarity] || 0) - (remainingCounts[rarity] || 0);
        if (soldHere > 0) globalCounts[rarity] = Math.max(0, (globalCounts[rarity] || 0) - soldHere);
      }
      await ctx.db.patch(stats._id, { counts: globalCounts });
    }

    return { soldItems: itemsSold, earned };
  },
});


export const prestige = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAppUser(ctx);

    if (!user.completedGame) {
      throw new Error("Complete the game first");
    }

    const prestigeCount = (user.prestigeCount || 0) + 1;
    await ctx.db.patch(user._id, {
      rarityCounts: {},
      discovered: user.discovered ?? {},
      rebirthCount: 0,
      completedGame: false,
      prestigeCount,
    });

    return { prestigeCount };
  },
});
