import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLuckBucks = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user?.luckbucks || 0;
  },
});

export const getActiveBoost = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!user?.activeLuckBoost) return null;
    if (user.activeLuckBoost.expiresAt <= Date.now()) return null;
    return user.activeLuckBoost;
  },
});

// Buy 1.5x luck for next roll (5 LB)
export const buySingleLuckBoost = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

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

// Buy 1 minute of luck boost (20 LB)
export const buyMinuteLuckBoost = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

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

// Cosmetic shop items
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
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const cosmetics = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .take(100);
    return cosmetics.map(c => c.cosmeticId);
  },
});

export const buyCosmetic = mutation({
  args: { email: v.string(), cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    // Check if already owned
    const existing = await ctx.db
      .query("user_cosmetics")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .take(100);

    if (existing.some(c => c.cosmeticId === args.cosmeticId)) {
      throw new Error("Already owned");
    }

    const cosmetic = COSMETICS.find(c => c.id === args.cosmeticId);
    if (!cosmetic) throw new Error("Invalid cosmetic");

    const lb = user.luckbucks || 0;
    if (lb < cosmetic.price) throw new Error("Not enough LuckBucks");

    if (cosmetic.price > 0) {
      await ctx.db.patch(user._id, { luckbucks: lb - cosmetic.price });
    }

    await ctx.db.insert("user_cosmetics", {
      email: args.email,
      cosmeticId: args.cosmeticId,
      purchasedAt: Date.now(),
    });

    return { success: true };
  },
});

export const equipCosmetic = mutation({
  args: { email: v.string(), cosmeticId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { equippedCosmetic: args.cosmeticId });
    return { success: true };
  },
});
