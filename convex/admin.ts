import { internalMutation } from "./_generated/server";

export const wipeAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all documents
    const tables = [
      "leaderboard",
      "users",
      "user_cosmetics",
      "global_stats"
    ] as const;

    // 2. Delete everything
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
    }

    return { message: "All data cleared successfully." };
  },
});
