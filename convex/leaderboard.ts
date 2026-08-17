import { query } from "./_generated/server";

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const rolls = await ctx.db.query("leaderboard").take(50000);
    const bestRolls = new Map<string, (typeof rolls)[0]>();
    for (const roll of rolls) {
      const existing = bestRolls.get(roll.username);
      if (!existing || roll.weight < existing.weight) {
        bestRolls.set(roll.username, roll);
      }
    }
    const sorted = [...bestRolls.values()].sort((a, b) => a.weight - b.weight);
    return sorted.slice(0, 10).map(({ username, rarity, weight }) => ({ username, rarity, weight }));
  },
});
