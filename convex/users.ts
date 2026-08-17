import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const signup = mutation({
  args: { email: v.string(), username: v.optional(v.string()), password: v.string() },
  handler: async (ctx, args) => {
    // Special check for root admin
    if (args.email === "root@root.root" || args.email === "root") {
      let rootUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", "root@root.root"))
        .first();

      if (!rootUser) {
        const rootId = await ctx.db.insert("users", {
          email: "root@root.root",
          username: "root",
          name: "Super Admin",
          bio: "Full Database Access Root Account",
          pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=root",
          password: args.password,
          createdAt: Date.now(),
        });
        rootUser = await ctx.db.get(rootId);
      }
      return rootUser!._id;
    }

    const uname = args.username || args.email.split("@")[0];

    // Check email uniqueness
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      // Update password if account exists
      await ctx.db.patch(existingEmail._id, {
        username: existingEmail.username || uname,
        name: existingEmail.name || uname,
        bio: existingEmail.bio || "Hey there!",
        pfp: existingEmail.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
        password: args.password,
      });
      return existingEmail._id;
    }

    // Check username uniqueness
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", uname))
      .first();

    if (existingUsername) {
      throw new Error("Username already taken. Please choose a different one.");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: uname,
      name: uname,
      bio: "Hey there! I am using Jasper Sona website.",
      pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=" + uname,
      password: args.password,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Special check for root/root.root
    if (args.email === "root@root.root" || args.email === "root") {
      let rootUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", "root@root.root"))
        .first();

      if (!rootUser) {
        const rootId = await ctx.db.insert("users", {
          email: "root@root.root",
          username: "root",
          name: "Super Admin",
          bio: "Full Database Access Root Account",
          pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=root",
          password: args.password,
          createdAt: Date.now(),
        });
        rootUser = await ctx.db.get(rootId);
      }
      return { userId: rootUser!._id, email: "root@root.root", username: "root" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password");
    }

    if (!user.username || !user.pfp) {
      const uname = user.email.split("@")[0];
      await ctx.db.patch(user._id, {
        username: user.username || uname,
        name: user.name || uname,
        bio: user.bio || "Hey there!",
        pfp: user.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
      });
    }

    return { userId: user._id, email: user.email, username: user.username || user.email.split("@")[0] };
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
      ...user,
      username: user.username || uname,
      name: user.name || uname,
      bio: user.bio || "Hey there!",
      pfp: user.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
    };
  },
});

export const updateProfile = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    pfp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

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

// Search users by username
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

    // For each matched user, find their best roll
    const results = [];
    for (const user of matched.slice(0, 20)) {
      const rolls = await ctx.db
        .query("leaderboard")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .take(1000);

      let bestWeight = Infinity;
      let bestRarity = "";
      for (const roll of rolls) {
        if (roll.weight < bestWeight) {
          bestWeight = roll.weight;
          bestRarity = roll.rarity;
        }
      }

      const uname = user.email.split("@")[0];
      results.push({
        email: user.email,
        username: user.username || uname,
        name: user.name || uname,
        pfp: user.pfp || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + uname),
        bestRarity,
        bestWeight,
        totalRolls: rolls.length,
      });
    }

    // Sort by best roll (lowest weight = rarest first)
    results.sort((a, b) => a.bestWeight - b.bestWeight);
    return results;
  },
});
