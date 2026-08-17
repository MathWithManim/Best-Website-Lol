import { mutation } from "./_generated/server";

export const insertHi = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.insert("test", { val: "hi" });
  },
});
