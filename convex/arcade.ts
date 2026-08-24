import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { rateLimiter } from "./rateLimits";
import { getAppUser } from "./users";
import { ARCADE, PLINKO_MULTS, WHEEL_MULTS } from "./shared";

// Side-arcade wagers. The server rolls, charges, and pays in one atomic
// mutation — the client never gets to declare its own win.

async function charge(balance: number, cost: number) {
  if (balance < cost) throw new Error(`Not enough LuckBucks (need ${cost})`);
}

export const playCoinFlip = mutation({
  args: { choice: v.union(v.literal("heads"), v.literal("tails")) },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    await rateLimiter.limit(ctx, "arcade", { key: user._id });
    await charge(user.luckbucks || 0, ARCADE.coin.cost);

    const landed = Math.random() < 0.5 ? "heads" : "tails";
    const won = landed === args.choice;
    const payout = won ? ARCADE.coin.win : 0;
    const balance = (user.luckbucks || 0) - ARCADE.coin.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { landed, won, payout, net: payout - ARCADE.coin.cost, balance };
  },
});

export const playPlinko = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAppUser(ctx);
    await rateLimiter.limit(ctx, "arcade", { key: user._id });
    await charge(user.luckbucks || 0, ARCADE.plinko.cost);

    // Binomial walk: center buckets are likely, edges are the jackpot.
    let pos = 4;
    for (let i = 0; i < 8; i++) pos += Math.random() < 0.5 ? -1 : 1;
    const multiplier = PLINKO_MULTS[pos];
    const payout = Math.floor(ARCADE.plinko.cost * multiplier);
    const balance = (user.luckbucks || 0) - ARCADE.plinko.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { bucket: pos, multiplier, payout, net: payout - ARCADE.plinko.cost, balance };
  },
});

export const startHiLo = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAppUser(ctx);
    await rateLimiter.limit(ctx, "arcade", { key: user._id });
    await charge(user.luckbucks || 0, ARCADE.hilo.cost);

    const card = 2 + Math.floor(Math.random() * 13);
    await ctx.db.patch(user._id, { hiloCard: card });
    return { card, balance: (user.luckbucks || 0) - ARCADE.hilo.cost };
  },
});

export const guessHiLo = mutation({
  args: { direction: v.union(v.literal("higher"), v.literal("lower")) },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    if (typeof user.hiloCard !== "number") throw new Error("Start a run first");

    const next = 2 + Math.floor(Math.random() * 13);
    let won: boolean;
    if (next === user.hiloCard) {
      won = true; // tie goes to the player
    } else {
      won = args.direction === "higher" ? next > user.hiloCard : next < user.hiloCard;
    }

    let balance = user.luckbucks || 0;
    let streakWon = 0;
    if (won) {
      streakWon = ARCADE.hilo.perGuess;
      balance += streakWon;
    }
    const patch: Record<string, number | undefined> = { luckbucks: balance };
    if (won) patch.hiloCard = next;
    else patch.hiloCard = undefined;
    await ctx.db.patch(user._id, patch);

    return { nextCard: next, won, wonLb: streakWon, balance, busted: !won };
  },
});

export const playWheel = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAppUser(ctx);
    await rateLimiter.limit(ctx, "arcade", { key: user._id });
    await charge(user.luckbucks || 0, ARCADE.wheel.cost);

    const segmentIndex = Math.floor(Math.random() * WHEEL_MULTS.length);
    const multiplier = WHEEL_MULTS[segmentIndex];
    const payout = Math.floor(ARCADE.wheel.cost * multiplier);
    const balance = (user.luckbucks || 0) - ARCADE.wheel.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { segmentIndex, multiplier, payout, net: payout - ARCADE.wheel.cost, balance };
  },
});
