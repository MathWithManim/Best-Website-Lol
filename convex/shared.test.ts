import { describe, it, expect } from 'vitest';
import {
  ROLL_COST_LADDER,
  rollCostFor,
  totalRaritiesFor,
} from './shared';

describe('rollCostFor', () => {
  it('first roll is free', () => {
    expect(rollCostFor(0)).toBe(0);
    expect(rollCostFor(-5)).toBe(0);
  });

  it('follows the ladder for sequential rolls', () => {
    const expected: number[] = [];
    for (let i = 1; i <= ROLL_COST_LADDER.length; i++) {
      expected.push(ROLL_COST_LADDER[i - 1]);
    }
    expect(expected[0]).toBe(1);
    expect(expected[9]).toBe(1);
    expect(expected[10]).toBe(2);
    expect(expected[14]).toBe(2);
    expect(expected[15]).toBe(4);
    expect(expected[18]).toBe(8);

    const actual = Array.from({ length: ROLL_COST_LADDER.length }, (_, i) => rollCostFor(i + 1));
    expect(actual).toEqual(expected);
  });

  it('cycles forever after the ladder', () => {
    expect(rollCostFor(ROLL_COST_LADDER.length + 1)).toBe(1);
    expect(rollCostFor(2 * ROLL_COST_LADDER.length + 3)).toBe(rollCostFor(3));
  });
});

describe('totalRaritiesFor', () => {
  it('starts at 50 and grows by 10 per rebirth', () => {
    expect(totalRaritiesFor(0)).toBe(50);
    expect(totalRaritiesFor(1)).toBe(60);
    expect(totalRaritiesFor(45)).toBe(500);
  });

  it('clamps at the maximum roster', () => {
    expect(totalRaritiesFor(46)).toBe(500);
    expect(totalRaritiesFor(1000)).toBe(500);
  });
});

import { ACHIEVEMENTS, evaluateAchievements } from './shared';
import {
  ARCADE,
  PLINKO_MULTS,
  WHEEL_MULTS,
  WHEEL_LABELS,
  arcadePayout,
} from './shared';

const baseStats = {
  rollCount: 0,
  rebirthCount: 0,
  distinctCaught: 0,
  completedGame: false,
  luckbucks: 0,
  ownsTopTierPull: false,
};

describe('achievements', () => {
  it('all locked for a fresh account', () => {
    expect(evaluateAchievements(baseStats).every((a) => !a.unlocked)).toBe(true);
  });

  it('unlock at exact thresholds', () => {
    const cases: Array<[string, typeof baseStats]> = [
      ['first-roll', { ...baseStats, rollCount: 1 }],
      ['century', { ...baseStats, rollCount: 100 }],
      ['roll-machine', { ...baseStats, rollCount: 1000 }],
      ['reborn', { ...baseStats, rebirthCount: 1 }],
      ['phoenix', { ...baseStats, rebirthCount: 5 }],
      ['collector', { ...baseStats, distinctCaught: 25 }],
      ['curator', { ...baseStats, distinctCaught: 100 }],
      ['halfway', { ...baseStats, distinctCaught: 250 }],
      ['completionist', { ...baseStats, completedGame: true }],
      ['high-roller', { ...baseStats, luckbucks: 1000 }],
      ['elite-pull', { ...baseStats, ownsTopTierPull: true }],
    ];
    for (const [id, stats] of cases) {
      const result = evaluateAchievements(stats).find((a) => a.id === id);
      expect(result?.unlocked, `${id} should unlock`).toBe(true);
    }
  });

  it('stay locked one step below threshold', () => {
    const cases: Array<[string, typeof baseStats]> = [
      ['century', { ...baseStats, rollCount: 99 }],
      ['phoenix', { ...baseStats, rebirthCount: 4 }],
      ['curator', { ...baseStats, distinctCaught: 99 }],
    ];
    for (const [id, stats] of cases) {
      const result = evaluateAchievements(stats).find((a) => a.id === id);
      expect(result?.unlocked, `${id} should stay locked`).toBe(false);
    }
  });

  it('have unique ids and non-empty names', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ACHIEVEMENTS.every((a) => a.name.length > 0 && a.description.length > 0)).toBe(true);
  });
});

import { computeBulkSale } from './shared';

describe('computeBulkSale', () => {
  it('sells only items at or below the value cap', () => {
    const counts = { Common: 5, Rare: 2, Fabled: 1 };
    const { earned, itemsSold, remainingCounts } = computeBulkSale(counts, 5);
    expect(earned).toBe(5 * 1 + 2 * 4);
    expect(itemsSold).toBe(7);
    expect(remainingCounts).toEqual({ Fabled: 1 });
    expect(counts).toEqual({ Common: 5, Rare: 2, Fabled: 1 });
  });

  it('returns zeros and untouched counts when nothing qualifies', () => {
    const counts = { Legendary: 3 };
    const { earned, itemsSold, remainingCounts } = computeBulkSale(counts, 4);
    expect(earned).toBe(0);
    expect(itemsSold).toBe(0);
    expect(remainingCounts).toEqual({ Legendary: 3 });
  });

  it('caps at the max threshold boundary inclusively', () => {
    const { earned, itemsSold } = computeBulkSale({ Rare: 1 }, 4);
    expect(itemsSold).toBe(1);
    expect(earned).toBe(4);
  });

  it('ignores unknown rarity names instead of crashing', () => {
    const { earned, itemsSold } = computeBulkSale({ NotARealRarity: 9, Common: 2 }, 100);
    expect(earned).toBe(2);
    expect(itemsSold).toBe(2);
  });
});

describe('arcade economy', () => {
  it('wheel has 8 segments and plinko 9 buckets', () => {
    expect(WHEEL_MULTS).toHaveLength(8);
    expect(PLINKO_MULTS).toHaveLength(9);
    expect(WHEEL_LABELS).toHaveLength(8);
  });

  it('payouts floor to whole LuckBucks', () => {
    expect(arcadePayout(10, 0.5)).toBe(5);
    expect(arcadePayout(10, 0.2)).toBe(2);
    expect(arcadePayout(25, 5)).toBe(125);
  });

  it('costs stay defined for every game', () => {
    expect(ARCADE.coin.cost).toBeGreaterThan(0);
    expect(ARCADE.plinko.cost).toBeGreaterThan(0);
    expect(ARCADE.hilo.cost).toBeGreaterThan(0);
    expect(ARCADE.wheel.cost).toBeGreaterThan(0);
  });
});
