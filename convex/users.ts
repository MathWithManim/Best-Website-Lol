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

// --- Constants ---
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_BASE_MS = 5 * 60 * 1000; // 5 minutes

// --- Helpers ---

function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateString(value: string, maxLen: number, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} is required`);
  }
  if (value.length > maxLen) {
    throw new Error(`${label} must be ${maxLen} characters or less`);
  }
}

/** Authenticate a user by session token. Throws if invalid or expired. */
export async function authenticate(ctx: { db: any }, sessionToken: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", sessionToken))
    .first();
  if (!user) throw new Error("Not authenticated. Please log in.");

  // Check token age
  if (user.tokenCreatedAt && (Date.now() - user.tokenCreatedAt) > TOKEN_MAX_AGE_MS) {
    throw new Error("Session expired. Please log in again.");
  }
  return user;
}

// --- Mutations ---

export const signup = mutation({
  args: { email: v.string(), username: v.optional(v.string()), password: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const uname = (args.username || email.split("@")[0]).trim();

    // Input validation
    validateString(email, 254, "Email");
    validateString(uname, 30, "Username");
    validateString(args.password, 128, "Password");

    // Block signup with root email
    if (email === "root@root.root" || email === "root") {
      throw new Error("Cannot create root account via signup.");
    }

    // Check email or username uniqueness — single generic error
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", uname))
      .first();

    if (existingEmail || existingUsername) {
      throw new Error("Account already exists. Please log in.");
    }

    const sessionToken = generateSessionToken();

    const userId = await ctx.db.insert("users", {
      email,
      username: uname,
      name: uname,
      bio: "Hey there! I am using Jasper Sona website.",
      pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=" + uname,
      password: args.password,
      sessionToken,
      tokenCreatedAt: Date.now(),
      createdAt: Date.now(),
    });

    return { userId, sessionToken };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    validateString(email, 254, "Email");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    // Generic error for both cases
    if (!user || user.password !== args.password) {
      // Rate limit: track failed attempts on the user doc (if user exists)
      if (user) {
        const attempts = (user.loginAttempts || 0) + 1;
        const lockoutUntil = attempts >= MAX_LOGIN_ATTEMPTS
          ? Date.now() + LOCKOUT_BASE_MS * Math.pow(2, Math.min(attempts - MAX_LOGIN_ATTEMPTS, 5))
          : undefined;
        await ctx.db.patch(user._id, { loginAttempts: attempts, lockoutUntil });
      }
      throw new Error("Invalid email or password");
    }

    // Check lockout
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const waitMin = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      throw new Error(`Too many failed attempts. Try again in ${waitMin} minute${waitMin > 1 ? 's' : ''}.`);
    }

    const sessionToken = generateSessionToken();
    await ctx.db.patch(user._id, {
      sessionToken,
      tokenCreatedAt: Date.now(),
      loginAttempts: 0,
      lockoutUntil: undefined,
    });

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
      await ctx.db.patch(user._id, { sessionToken: undefined, tokenCreatedAt: undefined });
    }
    return { success: true };
  },
});

/** Verify if the caller is root */
export async function requireRoot(ctx: { db: any }, sessionToken: string) {
  const user = await authenticate(ctx, sessionToken);
  if (user.email !== "root@root.root") {
    throw new Error("Unauthorized: Root access required");
  }
  return user;
}

// --- Admin Mutations ---
export const listUsers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireRoot(ctx, args.sessionToken);
    return await ctx.db.query("users").collect();
  },
});

export const updateUserStats = mutation({
  args: { sessionToken: v.string(), userId: v.id("users"), luckbucks: v.number() },
  handler: async (ctx, args) => {
    await requireRoot(ctx, args.sessionToken);
    await ctx.db.patch(args.userId, { luckbucks: args.luckbucks });
  },
});

export const deleteUser = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRoot(ctx, args.sessionToken);
    await ctx.db.delete(args.userId);
  },
});

// Internal: create root account (call from Convex dashboard only)
export const createRootAccount = internalMutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "iamarootuser@root.root"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { password: args.password });
      return { userId: existing._id, message: "Root password updated" };
    }

    const sessionToken = generateSessionToken();

    const userId = await ctx.db.insert("users", {
      email: "iamarootuser@root.root",
      username: "root",
      name: "Super Admin",
      bio: "Full Database Access Root Account",
      pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=root",
      password: args.password,
      sessionToken,
      tokenCreatedAt: Date.now(),
      createdAt: Date.now(),
    });

    return { userId, message: "Root account created" };
  },
});

export const getUser = query({
  args: { email: v.optional(v.string()), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email;
    if (!email) return null;

    // If sessionToken provided, verify it matches the requested email
    if (args.sessionToken) {
      const viewer = await ctx.db
        .query("users")
        .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", args.sessionToken))
        .first();
      if (!viewer || viewer.email !== normalizeEmail(email)) {
        throw new Error("Not authorized to view this profile");
      }
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
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

    // Input validation
    if (args.name !== undefined) validateString(args.name, 50, "Name");
    if (args.username !== undefined) {
      validateString(args.username, 30, "Username");
      const newUname = args.username.trim().toLowerCase();
      if (newUname !== user.username) {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", newUname))
          .first();
        if (existing) throw new Error("Username already taken");
      }
    }
    if (args.bio !== undefined) validateString(args.bio, 500, "Bio");
    if (args.pfp !== undefined) {
      validateString(args.pfp, 500, "Profile picture URL");
      // Only allow https URLs for profile pictures
      if (args.pfp && !args.pfp.startsWith("https://") && !args.pfp.startsWith("http://localhost")) {
        throw new Error("Profile picture must be an HTTPS URL");
      }
    }

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.username !== undefined && { username: args.username.trim() }),
      ...(args.bio !== undefined && { bio: args.bio }),
      ...(args.pfp !== undefined && { pfp: args.pfp }),
    });
  },
});

// Search users by username — requires sessionToken
export const searchUsers = query({
  args: { query: v.string(), sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.query || args.query.length < 1) return [];

    // Auth-gate: only logged-in users can search
    let currentEmail: string | undefined;
    if (args.sessionToken) {
      const viewer = await ctx.db
        .query("users")
        .withIndex("by_sessionToken", (q: any) => q.eq("sessionToken", args.sessionToken))
        .first();
      if (viewer) currentEmail = viewer.email;
    }

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
