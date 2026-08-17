import { query } from "./_generated/server";

// Get top rolls leaderboard - deduplicated by user (best roll per user)
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const rolls = await ctx.db.query("leaderboard").take(50000);
    // Deduplicate: keep only the best (lowest weight = rarest) roll per user
    const bestRolls = new Map<string, (typeof rolls)[0]>();
    for (const roll of rolls) {
      const existing = bestRolls.get(roll.email);
      if (!existing || roll.weight < existing.weight) {
        bestRolls.set(roll.email, roll);
      }
    }
    // Sort by weight ascending (rarest first)
    const sorted = [...bestRolls.values()].sort((a, b) => a.weight - b.weight);
    return sorted.slice(0, 50);
  },
});
