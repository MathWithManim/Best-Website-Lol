import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { RARITIES, WEIGHTS, rollCostFor, totalRaritiesFor } from "./shared";

// --- Constants ---
const ROOT_EMAIL = process.env.ROOT_EMAIL ?? "";

// --- Helpers ---

function validateString(value: string, maxLen: number, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} is required`);
  }
  if (value.length > maxLen) {
    throw new Error(`${label} must be ${maxLen} characters or less`);
  }
}

/** Resolve the authenticated caller's email from the Convex JWT identity. */
export async function getIdentityEmail(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) {
    throw new Error("Not authenticated. Please log in.");
  }
  return identity.email.toLowerCase();
}

/** Verify the caller is the root admin. Throws otherwise. */
async function requireRoot(ctx: QueryCtx | MutationCtx) {
  const email = await getIdentityEmail(ctx);
  if (email !== ROOT_EMAIL) {
    throw new Error("Unauthorized: Root access required");
  }
}

/**
 * Get the app user row for the authenticated caller.
 *
 * Looks up the `users` table by the authenticated email. If the row is missing
 * (e.g. a fresh Better Auth signup that hasn't written anything yet), it is
 * created. This preserves legacy rows from the old custom auth system, so all
 * existing game data (luckbucks, rarity counts, cosmetics) carries over.
 *
 * Mutations only — requires a write-capable context.
 */
export async function getAppUser(ctx: MutationCtx) {
  const email = await getIdentityEmail(ctx);
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (existing) return existing;

  const uname = (email.split("@")[0] || "player").slice(0, 30);
  const id = await ctx.db.insert("users", {
    email,
    username: uname,
    usernameLower: uname.toLowerCase(),
    name: uname,
    bio: "Hey there! I am using Jasper Sona website.",
    pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=" + uname,
    createdAt: Date.now(),
    luckbucks: 0,
  });
  const created = await ctx.db.get(id);
  if (!created) throw new Error("Failed to create user");
  return created;
}

// --- Profile Queries ---

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return null;

    const email = identity.email.toLowerCase();
    const uname = (identity.name || email.split("@")[0]).slice(0, 30);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const rebirthCount = user?.rebirthCount || 0;
    const rollCount = user?.rollCount || 0;
    const distinctCaught = Object.keys(user?.rarityCounts || {}).length;
    const totalRarities = totalRaritiesFor(rebirthCount);
    const nextRebirthAt = Math.min((rebirthCount + 1) * 10, 500);

    return {
      email,
      username: user?.username || uname,
      name: user?.name || uname,
      bio: user?.bio || "Hey there! I am using Jasper Sona website.",
      pfp: user?.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
      luckbucks: user?.luckbucks || 0,
      equippedCosmetic: user?.equippedCosmetic,
      rebirthCount,
      rollCount,
      nextRollCost: rollCostFor(rollCount),
      distinctCaught,
      totalRarities,
      nextRebirthAt,
      completedGame: user?.completedGame || false,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    pfp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);

    // Input validation
    if (args.name !== undefined) validateString(args.name, 50, "Name");
    if (args.username !== undefined) {
      validateString(args.username, 30, "Username");
      const newUname = args.username.trim();
      const newUnameLower = newUname.toLowerCase();
      if (newUnameLower !== (user.usernameLower || (user.username || "").toLowerCase())) {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_usernameLower", (q) => q.eq("usernameLower", newUnameLower))
          .first();
        if (existing) throw new Error("Username already taken");
      }
    }
    if (args.bio !== undefined) validateString(args.bio, 500, "Bio");
    if (args.pfp !== undefined) {
      validateString(args.pfp, 500, "Profile picture URL");
      let parsed: URL;
      try {
        parsed = new URL(args.pfp);
      } catch {
        throw new Error("Profile picture must be a valid URL");
      }
      // Only allow https, or http on the local dev origin
      const isHttps = parsed.protocol === "https:";
      const isLocalDev = parsed.protocol === "http:" && parsed.hostname === "localhost";
      if (!isHttps && !isLocalDev) {
        throw new Error("Profile picture must be an HTTPS URL");
      }
    }

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.username !== undefined && {
        username: args.username.trim(),
        usernameLower: args.username.trim().toLowerCase(),
      }),
      ...(args.bio !== undefined && { bio: args.bio }),
      ...(args.pfp !== undefined && { pfp: args.pfp }),
    });
  },
});

// Search users by username — requires authentication
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query || args.query.length < 1) return [];

    // Auth-gate: only logged-in users can search
    const currentEmail = await getIdentityEmail(ctx);

    const allUsers = await ctx.db.query("users").take(200);
    const searchLower = args.query.toLowerCase();

    const matched = allUsers.filter(u => {
      const uname = (u.username || u.email.split("@")[0]).toLowerCase();
      return uname.includes(searchLower) && u.email !== currentEmail;
    });

    const results = [];
    for (const user of matched.slice(0, 20)) {
      const counts = user.rarityCounts || {};
      const uname = user.email.split("@")[0];
      let bestRarity = "";
      let bestWeight = Infinity;
      let totalRolls = 0;
      for (const [rarity, count] of Object.entries(counts)) {
        totalRolls += count;
        const idx = RARITIES.indexOf(rarity);
        if (idx >= 0 && WEIGHTS[idx] < bestWeight) {
          bestWeight = WEIGHTS[idx];
          bestRarity = rarity;
        }
      }

      results.push({
        username: user.username || uname,
        name: user.name || uname,
        pfp: user.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
        bestRarity,
        bestWeight,
        totalRolls,
      });
    }

    results.sort((a, b) => a.bestWeight - b.bestWeight);
    return results;
  },
});

// --- Admin Queries/Mutations ---

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireRoot(ctx);
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      username: u.username,
      name: u.name,
      bio: u.bio,
      pfp: u.pfp,
      luckbucks: u.luckbucks || 0,
      equippedCosmetic: u.equippedCosmetic,
      rarityCounts: u.rarityCounts,
      createdAt: u.createdAt,
    }));
  },
});

export const updateUserStats = mutation({
  args: { userId: v.id("users"), luckbucks: v.number() },
  handler: async (ctx, args) => {
    await requireRoot(ctx);
    await ctx.db.patch(args.userId, { luckbucks: args.luckbucks });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRoot(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Cascade: remove leaderboard entries + owned cosmetics to avoid orphan rows
    const leaderboardEntries = await ctx.db
      .query("leaderboard")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .collect();
    await Promise.all(leaderboardEntries.map((entry) => ctx.db.delete(entry._id)));

    const cosmetics = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .collect();
    await Promise.all(cosmetics.map((c) => ctx.db.delete(c._id)));

    await ctx.db.delete(args.userId);
  },
});