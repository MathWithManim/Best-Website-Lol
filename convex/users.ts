import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const RARITIES = [
  "Common", "Uncommon", "Rare", "Legendary", "Mythical", "Divine", "Prismatic",
  "Transcendent", "Epic", "Unique", "Heroic", "Fabled", "Ancient", "Ethereal",
  "Celestial", "Astral", "Galactic", "Infinite", "Void", "Chaos", "Order",
  "Reality", "Existence", "Infinity", "Beyond", "Absolute", "Final", "Omega",
  "Alpha", "Zenith"
];

const WEIGHTS = [500000, 250000, 125000, 62500, 31250, 15625, 7812, 3906, 1953, 976, 488, 244, 122, 61, 30, 15, 7, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Authenticate a user by session token. Throws if invalid. */
export async function authenticate(ctx: { db: any }, sessionToken: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", sessionToken))
    .first();
  if (!user) throw new Error("Not authenticated. Please log in.");
  return user;
}

// --- Mutations ---

export const signup = mutation({
  args: { email: v.string(), username: v.optional(v.string()), password: v.string() },
  handler: async (ctx, args) => {
    const uname = args.username || args.email.split("@")[0];

    // Block signup with root email — root is created via internal mutation only
    if (args.email === "root@root.root" || args.email === "root") {
      throw new Error("Cannot create root account via signup.");
    }

    // Check email uniqueness
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      throw new Error("Account already exists. Please log in.");
    }

    // Check username uniqueness
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", uname))
      .first();

    if (existingUsername) {
      throw new Error("Username already taken. Please choose a different one.");
    }

    const sessionToken = generateSessionToken();

    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: uname,
      name: uname,
      bio: "Hey there! I am using Jasper Sona website.",
      pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=" + uname,
      password: args.password,
      sessionToken,
      createdAt: Date.now(),
    });

    return { userId, sessionToken };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.password !== args.password) {
      throw new Error("Invalid email or password");
    }

    const sessionToken = generateSessionToken();
    await ctx.db.patch(user._id, { sessionToken });

    return {
      userId: user._id,
      email: user.email,
      username: user.username || user.email.split("@")[0],
      sessionToken,
    };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (user) {
      await ctx.db.patch(user._id, { sessionToken: undefined });
    }
    return { success: true };
  },
});

// Internal: create root account (call from Convex dashboard only)
export const createRootAccount = internalMutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "root@root.root"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { password: args.password });
      return { userId: existing._id, message: "Root password updated" };
    }

    const sessionToken = generateSessionToken();

    const userId = await ctx.db.insert("users", {
      email: "root@root.root",
      username: "root",
      name: "Super Admin",
      bio: "Full Database Access Root Account",
      pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=root",
      password: args.password,
      sessionToken,
      createdAt: Date.now(),
    });

    return { userId, message: "Root account created" };
  },
});

export const getUser = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email;
    if (!email) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) return null;

    const uname = user.email.split("@")[0];
    return {
      username: user.username || uname,
      name: user.name || uname,
      bio: user.bio || "Hey there!",
      pfp: user.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
      luckbucks: user.luckbucks || 0,
      equippedCosmetic: user.equippedCosmetic,
    };
  },
});

export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    pfp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

    // Check username uniqueness if changing username
    if (args.username && args.username !== user.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .first();
      if (existing) throw new Error("Username already taken");
    }

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.username !== undefined && { username: args.username }),
      ...(args.bio !== undefined && { bio: args.bio }),
      ...(args.pfp !== undefined && { pfp: args.pfp }),
    });
  },
});

// Search users by username — returns no email
export const searchUsers = query({
  args: { query: v.string(), currentEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.query || args.query.length < 1) return [];

    const allUsers = await ctx.db.query("users").take(500);
    const searchLower = args.query.toLowerCase();

    const matched = allUsers.filter(u => {
      const uname = (u.username || u.email.split("@")[0]).toLowerCase();
      return uname.includes(searchLower) && u.email !== args.currentEmail;
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
