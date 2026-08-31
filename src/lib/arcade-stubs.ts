export const ARCADE = {
  plinko: { cost: 10, tiles: 12, payoutPct: 95 },
  coinflip: { cost: 5, payoutPct: 96 },
  wheel: { cost: 5, payoutPct: 96 },
  dice: { cost: 5, payoutPct: 95 },
  mines: { cost: 5, tiles: 9, mines: 3, maxPicks: 4, payoutPct: 90 },
  slots: { cost: 5, payoutPct: 96 },
  limbo: { cost: 5, minTarget: 1.5, maxTarget: 10, payoutPct: 96 },
  hilo: { cost: 5, payoutPct: 96 },
  cups: { cost: 5, payoutPct: 96 },
};
export const PLINKO_MULTS = [1, 3, 10, 20];
export const WHEEL_MULTS = [2, 3, 5];
export const WHEEL_LABELS = ['x2', 'x3', 'x5'];
export const SLOTS_TRIPLE_PAY = 50;
export const playWheel = (...args: any[]) => Promise.resolve({ segmentIndex: 0, mult: 2, net: 10 }) as any;
export const playPlinko = (...args: any[]) => Promise.resolve({ bucket: 0, mult: 1, net: 10 }) as any;
export const play = (...args: any[]) => Promise.resolve({ won: true, mult: 1, net: 5 }) as any;
export const flip = (...args: any[]) => Promise.resolve({ landed: 'heads', mult: 2, net: 10 }) as any;
export const start = (...args: any[]) => Promise.resolve({ card: 'A♥', nextCard: 'A♦' }) as any;
export const guess = (...args: any[]) => Promise.resolve({ outcome: 'win', payout: 10, net: 5 }) as any;
