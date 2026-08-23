import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { rateLimiter } from "./rateLimits";
import { getAppUser, getIdentityEmail } from "./users";

export const getLuckBucks = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const email = await getIdentityEmail(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    return user?.luckbucks || 0;
  },
});

export const getActiveBoost = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const email = await getIdentityEmail(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    return user?.activeLuckBoost || null;
  },
});

export const buySingleLuckBoost = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const user = await getAppUser(ctx);

    const buyLimit = await rateLimiter.limit(ctx, "buy", { key: user._id });
    if (!buyLimit.ok) throw new Error("Please wait a moment before buying");

    if (user.activeLuckBoost) {
      throw new Error("A luck boost is already active");
    }

    const lb = user.luckbucks || 0;
    if (lb < 5) throw new Error("Not enough LuckBucks (need 5)");

    await ctx.db.patch(user._id, {
      luckbucks: lb - 5,
      activeLuckBoost: {
        multiplier: 1.5,
        expiresAt: Date.now() + 3600000,
        rollsLeft: 1,
      },
    });

    return { newBalance: lb - 5 };
  },
});

export const buyMinuteLuckBoost = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const user = await getAppUser(ctx);

    const buyLimit = await rateLimiter.limit(ctx, "buy", { key: user._id });
    if (!buyLimit.ok) throw new Error("Please wait a moment before buying");

    if (user.activeLuckBoost) {
      throw new Error("A luck boost is already active");
    }

    const lb = user.luckbucks || 0;
    if (lb < 20) throw new Error("Not enough LuckBucks (need 20)");

    await ctx.db.patch(user._id, {
      luckbucks: lb - 20,
      activeLuckBoost: {
        multiplier: 1.5,
        expiresAt: Date.now() + 60000,
        rollsLeft: 999,
      },
    });

    return { newBalance: lb - 20 };
  },
});

const COSMETICS = [
  { 
    id: "bird", 
    name: "Bird", 
    icon: "BRD", 
    price: 75, 
    description: "Soar high with this bird.",
    theme: { bg: "#1F2937", primary: "#3B82F6", accent: "#2563EB" }
  },
  { 
    id: "cat", 
    name: "Cat", 
    icon: "CAT", 
    price: 150, 
    description: "Meow! A cute cat cosmetic.",
    theme: { bg: "#1F2937", primary: "#F472B6", accent: "#EC4899" }
  },
  { 
    id: "math", 
    name: "Math", 
    icon: "MAT", 
    price: 300, 
    description: "For the math enthusiasts.",
    theme: { bg: "#1F2937", primary: "#22C55E", accent: "#16A34A" }
  },
];

export const getCosmetics = query({
  args: {},
  handler: async () => {
    return COSMETICS;
  },
});

export const getUserCosmetics = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const email = await getIdentityEmail(ctx);
    const cosmetics = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    return cosmetics.map(c => c.cosmeticId);
  },
});

export const buyCosmetic = mutation({
  args: { cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);

    const buyLimit = await rateLimiter.limit(ctx, "buy", { key: user._id });
    if (!buyLimit.ok) throw new Error("Please wait a moment before buying");

    const cosmetic = COSMETICS.find(c => c.id === args.cosmeticId);
    if (!cosmetic) throw new Error("Invalid cosmetic");

    const existing = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .collect();

    if (existing.some(c => c.cosmeticId === args.cosmeticId)) {
      throw new Error("Already owned");
    }

    const lb = user.luckbucks || 0;
    if (lb < cosmetic.price) throw new Error("Not enough LuckBucks");

    if (cosmetic.price > 0) {
      await ctx.db.patch(user._id, { luckbucks: lb - cosmetic.price });
    }

    await ctx.db.insert("user_cosmetics", {
      email: user.email,
      cosmeticId: args.cosmeticId,
      purchasedAt: Date.now(),
    });

    return { success: true };
  },
});

export const equipCosmetic = mutation({
  args: { cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);

    // Validate cosmetic exists in catalog
    if (!COSMETICS.some(c => c.id === args.cosmeticId)) {
      throw new Error("Invalid cosmetic");
    }

    // Check ownership
    const owned = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .collect();

    if (!owned.some(c => c.cosmeticId === args.cosmeticId)) {
      throw new Error("You don't own this cosmetic");
    }

    await ctx.db.patch(user._id, { equippedCosmetic: args.cosmeticId });
    return { success: true };
  },
});
