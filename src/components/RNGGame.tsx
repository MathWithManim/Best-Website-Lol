import { useState, useRef, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RARITIES, RARITY_COLORS } from '../lib/rarities';

interface RNGGameProps {
  onRollComplete: () => void;
  equippedCosmetic?: string;
  rollCost: number;
  luckBucks: number;
  totalRarities: number;
}

const RNGGame = ({ onRollComplete, equippedCosmetic, rollCost, luckBucks, totalRarities }: RNGGameProps) => {
  const roll = useMutation(api.rng.roll);

  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [boostActive, setBoostActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  const handleRoll = useCallback(async () => {
    setRolling(true);
    setResult(null);
    setShowResult(false);
    setError(null);
    setBoostActive(false);

    // Slot machine: rapid cycle with exponential deceleration
    let currentIndex = 0;
    const totalDuration = 2800;
    const startTime = Date.now();

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Exponential decay for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const speed = 30 + eased * 350;

      currentIndex = (currentIndex + 1) % totalRarities;
      setDisplayIndex(currentIndex);

      if (progress < 1) {
        intervalRef.current = setTimeout(spin, speed);
      } else {
        (async () => {
          try {
            const outcome = await roll();
            const rarity = (outcome as { rarity: string; boostApplied: boolean }).rarity;
            const boostApplied = (outcome as { rarity: string; boostApplied: boolean }).boostApplied;
            setResult(rarity);
            setDisplayIndex(RARITIES.indexOf(rarity));
            setBoostActive(boostApplied);
            setShowResult(true);
            onRollComplete();
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Roll failed');
          } finally {
            setRolling(false);
          }
        })();
      }
    };

    intervalRef.current = setTimeout(spin, 30);
  }, [roll, onRollComplete, totalRarities]);

  const currentRarity = RARITIES[displayIndex];
  const currentColor = RARITY_COLORS[currentRarity] || '#8B4513';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Slot Machine Reel */}
      <div className="relative w-full h-40 md:h-52 overflow-hidden rounded-2xl border-4 border-primary dark:border-[#f4d5ad] bg-[#0a0a0a] shadow-2xl">
        {/* Neon Border Effect */}
        <div className="absolute inset-0 z-0 border-2 border-accent dark:border-[#c98a6e] opacity-20" />
        
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 border-y-4 border-accent dark:border-[#c98a6e] z-10 pointer-events-none bg-accent/10 shadow-[0_0_15px_rgba(160,82,45,0.5)]" />

        {/* Blur overlay during spin */}
        {rolling && (
          <div className="absolute inset-0 z-5 pointer-events-none backdrop-blur-[2px] flex items-center justify-center">
            {equippedCosmetic === 'cat' && (
              <m.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: [0.95, 1.2, 1], rotate: [0, 10, -10, 0], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-4xl"
              >
                🐱
              </m.div>
            )}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showResult && result ? (
              <m.div
                key="result"
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, mass: 0.5 }}
                className="text-center relative"
              >
                {/* Intense Glow ring for result */}
                <m.div
                  className="absolute -inset-10 rounded-full opacity-60 blur-2xl pointer-events-none"
                  style={{ backgroundColor: RARITY_COLORS[result] || '#8B4513' }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 2, 1], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
                <div
                  className="text-7xl md:text-8xl font-bold font-typewriter relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ color: '#fff' }}
                >
                  {RARITIES.indexOf(result) + 1}
                </div>
                <div
                  className="text-xl md:text-2xl font-mono mt-2 relative z-10 px-4 py-1 bg-black/50 rounded-lg text-white font-bold"
                  style={{ textShadow: `0 0 10px ${RARITY_COLORS[result]}` }}
                >
                  {result}
                </div>
                {boostActive && (
                  <m.div
                    className="text-xs font-mono text-green-400 mt-2 relative z-10 font-bold bg-black/50 px-2 py-0.5 rounded"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    ⚡ BOOSTED!
                  </m.div>
                )}
              </m.div>
            ) : (
              <m.div
                key={displayIndex}
                initial={{ y: rolling ? -30 : 0, opacity: rolling ? 0.5 : 1 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: rolling ? 0.03 : 0.15 }}
                className="text-center"
                style={rolling ? { filter: 'blur(1px)' } : {}}
              >
                <div
                  className="text-5xl md:text-6xl font-bold font-typewriter"
                  style={{ color: rolling ? `${currentColor}80` : currentColor }}
                >
                  {displayIndex + 1}
                </div>
                <div
                  className="text-base md:text-lg font-mono mt-1"
                  style={{ color: rolling ? `${currentColor}60` : currentColor }}
                >
                  {currentRarity}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 font-mono text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleRoll}
        disabled={rolling || luckBucks < rollCost}
        title={rollCost === 0 ? 'Execute a free roll' : `Execute a roll (costs ${rollCost} LuckBucks)`}
        className="w-full py-4 px-8 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-lg font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer active:scale-95"
      >
        {rolling ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Rolling...
          </span>
        ) : luckBucks < rollCost ? (
          `Need ${rollCost.toLocaleString()} LuckBucks`
        ) : rollCost === 0 ? (
          'Execute Roll (FREE)'
        ) : (
          `Execute Roll (${rollCost} LuckBucks)`
        )}
      </button>
    </div>
  );
};

export default RNGGame;
