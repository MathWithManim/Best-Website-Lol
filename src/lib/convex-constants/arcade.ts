export const ARCADE = {
  dice: { cost: 10, payoutPct: 50 },
  limbo: { minTarget: 2, maxTarget: 50, cost: 10, payoutPct: 50 },
  slots: { cost: 10 },
  coin: { cost: 10, payoutPct: 95 },
  cups: { cost: 10, payoutPct: 95 },
  plinko: { cost: 10, payoutPct: 95 },
  wheel: { cost: 10, payoutPct: 95 },
  hilo: { cost: 10, payoutPct: 96 },
  mines: { cost: 10, payoutPct: 95, tiles: 9, mines: 3, maxPicks: 5 },
} as const;
export const SLOTS_SYMBOLS = ['SEVEN','GEM','BOLT','MOON','BELL','STAR'];
export const SLOTS_TRIPLE_PAY: Record<string, number> = { SEVEN: 3 };
export const PLINKO_MULTS = [0.5, 1, 2, 3];
export const WHEEL_MULTS = [1, 2, 5, 10];
export const WHEEL_LABELS = ['A','B','C','D'];
