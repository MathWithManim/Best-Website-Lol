import { query } from "./_generated/server";

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const seen = new Set<string>();
    const top10: { username: string; rarity: string; weight: number }[] = [];

    for await (const roll of ctx.db.query("leaderboard").withIndex("by_weight")) {
      if (!seen.has(roll.email)) {
        seen.add(roll.email);
        top10.push({ username: roll.username, rarity: roll.rarity, weight: roll.weight });
        if (top10.length === 10) break;
      }
    }

    return top10;
  },
});
