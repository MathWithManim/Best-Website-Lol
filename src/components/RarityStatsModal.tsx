import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const RARITY_COLORS: Record<string, string> = {
  Common: '#9CA3AF',
  Uncommon: '#22C55E',
  Rare: '#3B82F6',
  Legendary: '#A855F7',
  Mythical: '#EC4899',
  Divine: '#F59E0B',
  Prismatic: '#06B6D4',
  Transcendent: '#8B5CF6',
  Epic: '#EF4444',
  Unique: '#14B8A6',
  Heroic: '#F97316',
  Fabled: '#D946EF',
  Ancient: '#78716C',
  Ethereal: '#A78BFA',
  Celestial: '#38BDF8',
  Astral: '#818CF8',
  Galactic: '#E879F9',
  Infinite: '#FBBF24',
  Void: '#1E1B4B',
  Chaos: '#DC2626',
  Order: '#2563EB',
  Reality: '#059669',
  Existence: '#7C3AED',
  Infinity: '#DB2777',
  Beyond: '#9333EA',
  Absolute: '#C2410C',
  Final: '#1D4ED8',
  Omega: '#B91C1C',
  Alpha: '#4338CA',
  Zenith: '#BE185D',
};

const RARITY_VALUES = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 30000, 50000, 100000];

interface RarityStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rarity: string;
  index: number;
  stats: { count: number; uniqueUsers: number; chance: number } | null;
  userCount: number;
  email: string;
  onSellComplete: () => void;
}

const RarityStatsModal = ({ isOpen, onClose, rarity, index, stats, userCount, email, onSellComplete }: RarityStatsModalProps) => {
  const color = RARITY_COLORS[rarity] || '#9CA3AF';
  const valuePerItem = index >= 0 && index < RARITY_VALUES.length ? RARITY_VALUES[index] : 1;
  const [selling, setSelling] = useState(false);
  const [sellResult, setSellResult] = useState<string | null>(null);
  const sellRarity = useMutation(api.rng.sellRarity);

  const handleSell = async (amount: number) => {
    if (selling) return;
    setSelling(true);
    setSellResult(null);
    try {
      const result = await sellRarity({ email, rarity, amount });
      setSellResult(`Sold ${result.sold}x ${rarity} for ${result.earned} LB!`);
      onSellComplete();
    } catch (err) {
      setSellResult(err instanceof Error ? err.message : 'Sell failed');
    } finally {
      setSelling(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white dark:bg-[#2d1e14] rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-primary/10 dark:border-[#f4d5ad]/10 overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Glow background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
              }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 dark:bg-[#f4d5ad]/10 flex items-center justify-center text-primary dark:text-[#f4d5ad] hover:bg-primary/20 dark:hover:bg-[#f4d5ad]/20 transition-colors cursor-pointer z-10"
            >
              x
            </button>

            <div className="text-center mb-6 relative z-10">
              <motion.div
                className="text-5xl font-bold font-typewriter mb-2"
                style={{ color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
              >
                {index + 1}
              </motion.div>
              <h2
                className="text-2xl font-bold font-mono"
                style={{ color }}
              >
                {rarity}
              </h2>
              <div className="text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50 mt-1">
                You own: {userCount} ({valuePerItem} LB each)
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <motion.div
                className="flex justify-between items-center py-3 border-b border-primary/10 dark:border-[#f4d5ad]/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70">Drop Rate</span>
                <span className="font-mono font-bold text-primary dark:text-[#f4d5ad]">
                  {stats ? `${stats.chance.toFixed(4)}%` : '---'}
                </span>
              </motion.div>

              <motion.div
                className="flex justify-between items-center py-3 border-b border-primary/10 dark:border-[#f4d5ad]/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70">Total Rolls</span>
                <span className="font-mono font-bold text-primary dark:text-[#f4d5ad]">
                  {stats ? stats.count.toLocaleString() : '---'}
                </span>
              </motion.div>

              <motion.div
                className="flex justify-between items-center py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <span className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70">Unique Players</span>
                <span className="font-mono font-bold text-primary dark:text-[#f4d5ad]">
                  {stats ? stats.uniqueUsers.toLocaleString() : '---'}
                </span>
              </motion.div>
            </div>

            {/* Sell buttons */}
            {userCount > 0 && (
              <motion.div
                className="mt-6 space-y-3 relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50 text-center">Sell for LuckBucks</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSell(1)}
                    disabled={selling}
                    className="flex-1 py-2 px-3 bg-accent dark:bg-[#c98a6e] text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    1x ({valuePerItem} LB)
                  </button>
                  <button
                    onClick={() => handleSell(10)}
                    disabled={selling || userCount < 10}
                    className="flex-1 py-2 px-3 bg-accent dark:bg-[#c98a6e] text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    10x ({valuePerItem * 10} LB)
                  </button>
                  <button
                    onClick={() => handleSell(-1)}
                    disabled={selling}
                    className="flex-1 py-2 px-3 bg-red-600 text-white font-mono text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    All ({userCount * valuePerItem} LB)
                  </button>
                </div>
                {sellResult && (
                  <p className="text-xs font-mono text-green-600 dark:text-green-400 text-center">{sellResult}</p>
                )}
              </motion.div>
            )}

            <div
              className="mt-6 h-2 rounded-full opacity-60"
              style={{ backgroundColor: color }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RarityStatsModal;
