import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAppUser } from "./users";
import {
  ARCADE,
  PLINKO_MULTS,
  WHEEL_MULTS,
  SLOTS_SYMBOLS,
  SLOTS_WEIGHTS,
  SLOTS_TRIPLE_PAY,
  SLOTS_PAIR_PAY,
} from "./shared";

// Side-arcade wagers. The server rolls, charges, and pays in one atomic
// mutation — the client never gets to declare its own win.
// Every game is negative-EV (~4% house edge), so unlimited free play for any
// signed-up user cannot inflate the LuckBucks supply: grinding only grinds.

async function charge(balance: number, cost: number) {
  if (balance < cost) throw new Error(`Not enough LuckBucks (need ${cost})`);
}

export const playCoinFlip = mutation({
  args: { choice: v.union(v.literal("heads"), v.literal("tails")) },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
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
    await charge(user.luckbucks || 0, ARCADE.hilo.cost);

    const card = 2 + Math.floor(Math.random() * 13);
    const balance = (user.luckbucks || 0) - ARCADE.hilo.cost;
    await ctx.db.patch(user._id, { hiloCard: card, luckbucks: balance });
    return { card, balance };
  },
});

export const guessHiLo = mutation({
  args: { direction: v.union(v.literal("higher"), v.literal("lower")) },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    if (typeof user.hiloCard !== "number") throw new Error("Start a round first");

    const card = user.hiloCard;
    const next = 2 + Math.floor(Math.random() * 13);
    const ways = args.direction === "higher" ? 14 - card : card - 2;

    // Tie is a push. Otherwise odds-based payout: fair odds x 0.96.
    let payout: number;
    let outcome: "win" | "lose" | "push";
    if (next === card) {
      payout = ARCADE.hilo.cost;
      outcome = "push";
    } else {
      const won = args.direction === "higher" ? next > card : next < card;
      if (won) {
        const mult = Math.floor(((ARCADE.hilo.payoutPct * 13) / ways) * 100) / 100;
        payout = Math.floor(ARCADE.hilo.cost * mult);
        outcome = "win";
      } else {
        payout = 0;
        outcome = "lose";
      }
    }

    const balance = (user.luckbucks || 0) + payout; // stake was charged at start
    await ctx.db.patch(user._id, { hiloCard: undefined, luckbucks: balance });
    return { nextCard: next, outcome, payout, net: payout - ARCADE.hilo.cost, balance };
  },
});

export const playWheel = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAppUser(ctx);
    await charge(user.luckbucks || 0, ARCADE.wheel.cost);

    const segmentIndex = Math.floor(Math.random() * WHEEL_MULTS.length);
    const multiplier = WHEEL_MULTS[segmentIndex];
    const payout = Math.floor(ARCADE.wheel.cost * multiplier);
    const balance = (user.luckbucks || 0) - ARCADE.wheel.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { segmentIndex, multiplier, payout, net: payout - ARCADE.wheel.cost, balance };
  },
});

export const playDice = mutation({
  args: {
    target: v.number(),
    direction: v.union(v.literal("over"), v.literal("under")),
  },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    await charge(user.luckbucks || 0, ARCADE.dice.cost);
    if (!Number.isInteger(args.target) || args.target < 2 || args.target > 98) {
      throw new Error("Target must be a whole number between 2 and 98");
    }

    const roll = 1 + Math.floor(Math.random() * 100);
    const chance =
      args.direction === "over" ? (100 - args.target) / 100 : (args.target - 1) / 100;
    const mult = Math.round((ARCADE.dice.payoutPct / chance) * 100) / 100;
    const won = args.direction === "over" ? roll > args.target : roll < args.target;
    const payout = won ? Math.floor(ARCADE.dice.cost * mult) : 0;
    const balance = (user.luckbucks || 0) - ARCADE.dice.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return {
      roll,
      target: args.target,
      direction: args.direction,
      mult,
      won,
      payout,
      net: payout - ARCADE.dice.cost,
      balance,
    };
  },
});

function comb(n: number, k: number): number {
  let result = 1;
  for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
  return result;
}

export const playMines = mutation({
  args: { picks: v.array(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    const { tiles, mines: mineCount, maxPicks } = ARCADE.mines;
    await charge(user.luckbucks || 0, ARCADE.mines.cost);
    const distinct = new Set(args.picks);
    if (
      args.picks.length < 1 ||
      args.picks.length > maxPicks ||
      distinct.size !== args.picks.length ||
      args.picks.some((p) => !Number.isInteger(p) || p < 0 || p >= tiles)
    ) {
      throw new Error(`Pick between 1 and ${maxPicks} distinct tiles`);
    }

    // Mines are drawn only after the picks arrive — no information edge.
    const positions = Array.from({ length: tiles }, (_, i) => i);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    const mineSet = new Set(positions.slice(0, mineCount));

    const k = args.picks.length;
    const safeCombos = comb(tiles - mineCount, k);
    const totalCombos = comb(tiles, k);
    const mult =
      Math.round(((ARCADE.mines.payoutPct * totalCombos) / safeCombos) * 100) / 100;

    const won = args.picks.every((p) => !mineSet.has(p));
    const payout = won ? Math.floor(ARCADE.mines.cost * mult) : 0;
    const balance = (user.luckbucks || 0) - ARCADE.mines.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return {
      mines: [...mineSet],
      picks: args.picks,
      mult,
      won,
      payout,
      net: payout - ARCADE.mines.cost,
      balance,
    };
  },
});

export const playSlots = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAppUser(ctx);
    await charge(user.luckbucks || 0, ARCADE.slots.cost);

    const pool: string[] = [];
    for (const symbol of SLOTS_SYMBOLS) {
      for (let i = 0; i < SLOTS_WEIGHTS[symbol]; i++) pool.push(symbol);
    }
    const spin = () => pool[Math.floor(Math.random() * pool.length)];
    const reels = [spin(), spin(), spin()] as Array<(typeof SLOTS_SYMBOLS)[number]>;

    let multiplier = 0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      multiplier = SLOTS_TRIPLE_PAY[reels[0]];
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      multiplier = SLOTS_PAIR_PAY;
    }

    const payout = Math.floor(ARCADE.slots.cost * multiplier);
    const balance = (user.luckbucks || 0) - ARCADE.slots.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { reels, multiplier, payout, net: payout - ARCADE.slots.cost, balance };
  },
});

export const playLimbo = mutation({
  args: { target: v.number() },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    const { minTarget, maxTarget } = ARCADE.limbo;
    await charge(user.luckbucks || 0, ARCADE.limbo.cost);
    if (typeof args.target !== "number" || args.target < minTarget || args.target > maxTarget) {
      throw new Error(`Target multiplier must be between ${minTarget} and ${maxTarget}`);
    }

    const roll = Math.random();
    const won = roll < ARCADE.limbo.payoutPct / args.target;
    const payout = won ? Math.floor(ARCADE.limbo.cost * args.target) : 0;
    const balance = (user.luckbucks || 0) - ARCADE.limbo.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { roll, target: args.target, won, payout, net: payout - ARCADE.limbo.cost, balance };
  },
});

export const playCups = mutation({
  args: { pick: v.number() },
  handler: async (ctx, args) => {
    const user = await getAppUser(ctx);
    await charge(user.luckbucks || 0, ARCADE.cups.cost);
    if (!Number.isInteger(args.pick) || args.pick < 0 || args.pick >= ARCADE.cups.cups) {
      throw new Error("Pick a valid cup");
    }

    const ball = Math.floor(Math.random() * ARCADE.cups.cups);
    const won = ball === args.pick;
    const payout = won ? Math.floor(ARCADE.cups.cost * ARCADE.cups.payoutMult) : 0;
    const balance = (user.luckbucks || 0) - ARCADE.cups.cost + payout;
    await ctx.db.patch(user._id, { luckbucks: balance });
    return { ball, pick: args.pick, won, payout, net: payout - ARCADE.cups.cost, balance };
  },
});
