import { internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const TABLES_TO_WIPE = [
  "leaderboard",
  "users",
  "user_cosmetics",
  "global_stats",
  "admin_audit",
] as const;

export const wipeAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const table of TABLES_TO_WIPE) {
      const docs = await ctx.db.query(table).collect();
      await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
    }

    await ctx.db.insert("admin_audit", {
      adminEmail: "system",
      action: "wipeAllData",
      timestamp: Date.now(),
    });

    return { message: "All data cleared successfully." };
  },
});

const LEGACY_AUTH_KEYS = [
  "password",
  "sessionToken",
  "tokenCreatedAt",
  "loginAttempts",
  "lockoutUntil",
  "resetSecret",
] as const;

type LegacyAuthPatch = Partial<Doc<"users">> & {
  password?: undefined;
  sessionToken?: undefined;
  tokenCreatedAt?: undefined;
  loginAttempts?: undefined;
  lockoutUntil?: undefined;
  resetSecret?: undefined;
};

// One-shot migration — run AFTER deploying the slimmed schema:
//   npx convex run admin:stripLegacyAuthFields
export const stripLegacyAuthFields = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    let stripped = 0;
    let scanned = 0;
    for (const user of users) {
      scanned += 1;
      const record = user as unknown as Record<string, unknown>;
      if (LEGACY_AUTH_KEYS.every((key) => record[key] === undefined)) continue;

      const patchPayload: LegacyAuthPatch = {
        password: undefined,
        sessionToken: undefined,
        tokenCreatedAt: undefined,
        loginAttempts: undefined,
        lockoutUntil: undefined,
        resetSecret: undefined,
      };
      await ctx.db.patch(user._id, patchPayload);
      stripped += 1;
    }

    await ctx.db.insert("admin_audit", {
      adminEmail: "system",
      action: "stripLegacyAuthFields",
      details: `scanned=${scanned} stripped=${stripped}`,
      timestamp: Date.now(),
    });

    return { scanned, stripped };
  },
});
