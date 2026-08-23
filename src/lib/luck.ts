import { RARITY_VALUES, WEIGHTS } from './rarities';
import type { RollHistoryEntry } from './rollHistory';

export interface DayBucket {
  day: string;
  rolls: number;
}

export interface LuckStats {
  sampleSize: number;
  actualEV: number;
  expectedEV: number;
  luckRatio: number;
  bestPull: { rarity: string; index: number } | null;
  perDay: DayBucket[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const dayKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Weighted average sell value of the pool a pull came from. Cached because
// most pulls share the same unlocked-pool size.
const evCache = new Map<number, number>();
function expectedValueFor(unlocked: number): number {
  const n = Math.min(Math.max(unlocked, 1), 500);
  if (evCache.has(n)) return evCache.get(n)!;
  let wSum = 0;
  let wv = 0;
  for (let i = 0; i < n; i++) {
    const w = WEIGHTS[i] ?? 0;
    wSum += w;
    wv += w * (RARITY_VALUES[i] ?? 1);
  }
  const ev = wSum > 0 ? wv / wSum : 0;
  evCache.set(n, ev);
  return ev;
}

// Luck ratio = mean value of your pulls ÷ the odds-weighted value you were
// supposed to get from the same pools. Only pulls that recorded their pool
// size count toward the ratio; every entry feeds the activity chart.
export function computeLuckStats(entries: RollHistoryEntry[]): LuckStats {
  let sumActual = 0;
  let sumExpected = 0;
  let sampleSize = 0;
  let bestPull: { rarity: string; index: number } | null = null;

  for (const e of entries) {
    const value = RARITY_VALUES[e.index] ?? 1;
    if (!bestPull || e.index > bestPull.index) {
      bestPull = { rarity: e.rarity, index: e.index };
    }
    if (typeof e.unlocked !== 'number' || e.unlocked <= 0) continue;
    sumActual += value;
    sumExpected += expectedValueFor(e.unlocked);
    sampleSize += 1;
  }

  const actualEV = sampleSize > 0 ? sumActual / sampleSize : 0;
  const expectedEV = sampleSize > 0 ? sumExpected / sampleSize : 0;
  const luckRatio = expectedEV > 0 ? round2(actualEV / expectedEV) : 1;

  const buckets: DayBucket[] = [];
  const now = Date.now();
  for (let i = 13; i >= 0; i--) {
    buckets.push({ day: dayKey(now - i * 86400000), rolls: 0 });
  }
  const indexOfKey = new Map(buckets.map((b, i) => [b.day, i]));
  for (const e of entries) {
    const i = indexOfKey.get(dayKey(e.at));
    if (i !== undefined) buckets[i].rolls += 1;
  }

  return {
    sampleSize,
    actualEV: round2(actualEV),
    expectedEV: round2(expectedEV),
    luckRatio,
    bestPull,
    perDay: buckets,
  };
}

export function luckVerdict(ratio: number): { label: string; tone: 'lucky' | 'average' | 'unlucky' } {
  if (ratio >= 1.15) return { label: 'Blessed', tone: 'lucky' };
  if (ratio <= 0.85) return { label: 'Cursed', tone: 'unlucky' };
  return { label: 'Dead Average', tone: 'average' };
}
