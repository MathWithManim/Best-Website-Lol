import { describe, it, expect } from 'vitest';
import { computeLuckStats, luckVerdict } from './luck';
import { RARITY_VALUES } from './rarities';
import type { RollHistoryEntry } from './rollHistory';

const entry = (over: Partial<RollHistoryEntry>): RollHistoryEntry => ({
  rarity: 'Test',
  index: 0,
  at: Date.now(),
  ...over,
});

describe('computeLuckStats', () => {
  it('reports blessed when every pull is the best of a tiny pool', () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      entry({ rarity: 'Top', index: 9, at: Date.now() - i * 3600_000, unlocked: 10 })
    );
    const stats = computeLuckStats(entries);
    expect(stats.sampleSize).toBe(12);
    expect(stats.actualEV).toBe(RARITY_VALUES[9]);
    expect(stats.luckRatio).toBeGreaterThan(2);
    expect(stats.bestPull?.index).toBe(9);
  });

  it('ignores entries without pool data for the ratio but keeps their chart', () => {
    const mixed = [
      entry({ index: 5, unlocked: 50 }),
      entry({ index: 1 }),
      entry({ index: 3, unlocked: 0 }),
    ];
    const stats = computeLuckStats(mixed);
    expect(stats.sampleSize).toBe(1);
    expect(stats.perDay.reduce((s, d) => s + d.rolls, 0)).toBe(3);
    expect(stats.perDay).toHaveLength(14);
  });

  it('is neutral with no data', () => {
    const stats = computeLuckStats([]);
    expect(stats.luckRatio).toBe(1);
    expect(stats.bestPull).toBeNull();
  });
});

describe('luckVerdict', () => {
  it('classifies thresholds', () => {
    expect(luckVerdict(1.2).tone).toBe('lucky');
    expect(luckVerdict(1.0).tone).toBe('average');
    expect(luckVerdict(0.5).tone).toBe('unlucky');
  });
});
