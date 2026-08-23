import { query } from "./_generated/server";
import { RARITIES, RARITY_VALUES } from "./shared";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function rarityValue(rarity: string): number {
  const idx = RARITIES.indexOf(rarity);
  return idx >= 0 ? RARITY_VALUES[idx] : 1;
}

function roman(n: number): string {
  const table: Array<[number, string]> = [
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [val, sym] of table) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out || "I";
}

export interface WeeklyTierEntry {
  username: string;
  score: number;
  bestRarity: string;
}

export interface WeeklyTierBoard {
  tier: number;
  label: string;
  entries: WeeklyTierEntry[];
}

// Weekly race split by rebirth tier: every player competes only against
// others on the same rebirth level, and every tier's board is public.
export const getWeeklyLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const since = Date.now() - WEEK_MS;
    const tiers = new Map<
      number,
      Map<string, { username: string; score: number; bestRarity: string; bestIdx: number }>
    >();

    for await (const roll of ctx.db.query("leaderboard").withIndex("by_timestamp", (q) =>
      q.gte("timestamp", since)
    )) {
      let board = tiers.get(roll.rebirthCount);
      if (!board) {
        board = new Map();
        tiers.set(roll.rebirthCount, board);
      }
      const cur = board.get(roll.email);
      const idx = RARITIES.indexOf(roll.rarity);
      if (cur) {
        cur.score += rarityValue(roll.rarity);
        if (idx > cur.bestIdx) {
          cur.bestIdx = idx;
          cur.bestRarity = roll.rarity;
        }
      } else {
        board.set(roll.email, {
          username: roll.username,
          score: rarityValue(roll.rarity),
          bestRarity: roll.rarity,
          bestIdx: idx,
        });
      }
    }

    return [...tiers.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([tier, board]): WeeklyTierBoard => ({
        tier,
        label: `Rebirth ${roman(tier + 1)}`,
        entries: [...board.values()]
          .sort((x, y) => y.score - x.score)
          .slice(0, 10)
          .map(({ username, score, bestRarity }) => ({ username, score, bestRarity })),
      }));
  },
});

export const getRecentWins = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("leaderboard").withIndex("by_timestamp").order("desc").take(8);
    return rows.map(({ username, rarity, timestamp }) => ({ username, rarity, timestamp }));
  },
});

export const getTotalRolls = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("global_stats")
      .withIndex("by_docId", (q) => q.eq("docId", "main"))
      .first();
    return stats?.totalRolls || 0;
  },
});
