import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate } from "./users";

export const getLuckBucks = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);
    return user.luckbucks || 0;
  },
});

export const getActiveBoost = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);
    if (!user.activeLuckBoost) return null;
    if (user.activeLuckBoost.expiresAt <= Date.now()) return null;
    return user.activeLuckBoost;
  },
});

export const buySingleLuckBoost = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

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
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

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
  { id: "cat", name: "Cat", icon: "🐱", price: 0, description: "Meow! A cute cat cosmetic." },
  { id: "math", name: "Math", icon: "📐", price: 0, description: "For the math enthusiasts." },
  { id: "bird", name: "Bird", icon: "🐦", price: 0, description: "Soar high with this bird." },
];

export const getCosmetics = query({
  args: {},
  handler: async () => {
    return COSMETICS;
  },
});

export const getUserCosmetics = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);
    const cosmetics = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .take(100);
    return cosmetics.map(c => c.cosmeticId);
  },
});

export const buyCosmetic = mutation({
  args: { sessionToken: v.string(), cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

    const cosmetic = COSMETICS.find(c => c.id === args.cosmeticId);
    if (!cosmetic) throw new Error("Invalid cosmetic");

    const existing = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .take(100);

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
  args: { sessionToken: v.string(), cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.sessionToken);

    // Validate cosmetic exists in catalog
    if (!COSMETICS.some(c => c.id === args.cosmeticId)) {
      throw new Error("Invalid cosmetic");
    }

    // Check ownership
    const owned = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .take(100);

    if (!owned.some(c => c.cosmeticId === args.cosmeticId)) {
      throw new Error("You don't own this cosmetic");
    }

    await ctx.db.patch(user._id, { equippedCosmetic: args.cosmeticId });
    return { success: true };
  },
});
