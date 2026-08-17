import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RARITY_COLORS } from './RarityStatsModal';

const RARITIES = [
  "Common", "Uncommon", "Rare", "Legendary", "Mythical", "Divine", "Prismatic",
  "Transcendent", "Epic", "Unique", "Heroic", "Fabled", "Ancient", "Ethereal",
  "Celestial", "Astral", "Galactic", "Infinite", "Void", "Chaos", "Order",
  "Reality", "Existence", "Infinity", "Beyond", "Absolute", "Final", "Omega",
  "Alpha", "Zenith"
];

interface RNGGameProps {
  onRollComplete: () => void;
}

const RNGGame = ({ onRollComplete }: RNGGameProps) => {
  const roll = useMutation(api.rng.roll);
  const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || undefined : undefined;

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
    const lastRoll = localStorage.getItem('lastRollTime');
    if (lastRoll && Date.now() - Number(lastRoll) < 1000) {
      setError("Please wait a moment before rolling again.");
      return;
    }

    setRolling(true);
    setResult(null);
    setShowResult(false);
    setError(null);
    setBoostActive(false);
    localStorage.setItem('lastRollTime', String(Date.now()));

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

      currentIndex = (currentIndex + 1) % RARITIES.length;
      setDisplayIndex(currentIndex);

      if (progress < 1) {
        intervalRef.current = setTimeout(spin, speed);
      } else {
        (async () => {
          try {
            const outcome = await roll({ email });
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
  }, [roll, email, onRollComplete]);

  const currentRarity = RARITIES[displayIndex];
  const currentColor = RARITY_COLORS[currentRarity] || '#8B4513';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Slot Machine Reel */}
      <div className="relative w-full h-40 md:h-52 overflow-hidden rounded-2xl border-2 border-primary/30 dark:border-[#f4d5ad]/30 bg-white/50 dark:bg-[#1a120b]/80 shadow-inner">
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-bg dark:from-[#1a120b] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg dark:from-[#1a120b] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 border-y-2 border-accent/40 dark:border-[#c98a6e]/40 z-10 pointer-events-none" />

        {/* Blur overlay during spin */}
        {rolling && (
          <div className="absolute inset-0 z-5 pointer-events-none backdrop-blur-[1px]" />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showResult && result ? (
              <motion.div
                key="result"
                initial={{ scale: 2, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, mass: 0.8 }}
                className="text-center relative"
              >
                {/* Glow ring for result */}
                <motion.div
                  className="absolute -inset-8 rounded-full opacity-30 blur-xl pointer-events-none"
                  style={{ backgroundColor: RARITY_COLORS[result] || '#8B4513' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <div
                  className="text-6xl md:text-7xl font-bold font-typewriter relative z-10"
                  style={{ color: RARITY_COLORS[result] || '#8B4513' }}
                >
                  {RARITIES.indexOf(result) + 1}
                </div>
                <div
                  className="text-lg md:text-xl font-mono mt-1 relative z-10"
                  style={{ color: RARITY_COLORS[result] || '#A0522D' }}
                >
                  {result}
                </div>
                {boostActive && (
                  <motion.div
                    className="text-xs font-mono text-green-500 mt-2 relative z-10"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    ⚡ Boost Applied!
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
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
              </motion.div>
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
        disabled={rolling}
        className="w-full py-4 px-8 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-lg font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer active:scale-95"
      >
        {rolling ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Rolling...
          </span>
        ) : (
          'Execute Roll'
        )}
      </button>
    </div>
  );
};

export default RNGGame;
