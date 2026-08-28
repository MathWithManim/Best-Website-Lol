import { RARITIES, WEIGHTS } from './rarities';

// Local RNG fallback for Neon migration — mirrors Convex RNG logic
// Uses weighted random over unlocked pool (totalRarities)
export function localRoll(totalRarities: number): { rarity: string; boostApplied: boolean } {
  const n = Math.min(Math.max(totalRarities, 1), RARITIES.length);
  const poolWeights = WEIGHTS.slice(0, n);
  const totalWeight = poolWeights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  let idx = 0;
  for (let i = 0; i < poolWeights.length; i++) {
    r -= poolWeights[i];
    if (r <= 0) { idx = i; break; }
  }
  return { rarity: RARITIES[idx], boostApplied: false };
}
