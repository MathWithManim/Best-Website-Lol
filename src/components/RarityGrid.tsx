import { motion } from 'framer-motion';
import { RARITY_COLORS } from './RarityStatsModal';

const RARITIES = [
  "Common", "Uncommon", "Rare", "Legendary", "Mythical", "Divine", "Prismatic",
  "Transcendent", "Epic", "Unique", "Heroic", "Fabled", "Ancient", "Ethereal",
  "Celestial", "Astral", "Galactic", "Infinite", "Void", "Chaos", "Order",
  "Reality", "Existence", "Infinity", "Beyond", "Absolute", "Final", "Omega",
  "Alpha", "Zenith"
];

interface RarityGridProps {
  rarityCounts: Record<string, number>;
  onRarityClick: (rarity: string, index: number) => void;
  isLoading: boolean;
}

const RarityGrid = ({ rarityCounts, onRarityClick, isLoading }: RarityGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 w-full">
        {RARITIES.map((rarity) => (
          <div
            key={rarity}
            className="aspect-square rounded-xl flex items-center justify-center bg-primary/5 dark:bg-[#f4d5ad]/5 border-2 border-primary/10 dark:border-[#f4d5ad]/10"
          >
            <div className="animate-pulse w-6 h-6 rounded bg-primary/20 dark:bg-[#f4d5ad]/20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 w-full">
      {RARITIES.map((rarity, index) => {
        const count = rarityCounts[rarity] || 0;
        const unlocked = count > 0;
        const color = RARITY_COLORS[rarity] || '#9CA3AF';

        return (
          <motion.button
            key={rarity}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.03,
              duration: 0.3,
              ease: 'easeOut',
            }}
            whileHover={unlocked ? {
              scale: 1.08,
              y: -4,
              boxShadow: `0 8px 24px ${color}35`,
            } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            onClick={() => unlocked && onRarityClick(rarity, index)}
            disabled={!unlocked}
            className={`
              relative aspect-square rounded-xl flex flex-col items-center justify-center
              border-2 cursor-pointer
              ${unlocked
                ? 'active:scale-95'
                : 'opacity-25 grayscale cursor-not-allowed'
              }
            `}
            style={{
              borderColor: unlocked ? color : undefined,
              backgroundColor: unlocked ? `${color}15` : undefined,
              boxShadow: unlocked ? `0 2px 8px ${color}30` : undefined,
            }}
            title={unlocked ? `${rarity} (${count})` : 'Locked'}
          >
            {/* Count badge */}
            {unlocked && count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15, delay: index * 0.03 + 0.2 }}
                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold font-mono text-white px-1 z-10"
                style={{ backgroundColor: color }}
              >
                {count}
              </motion.span>
            )}

            {/* Lock icon for locked rarities */}
            {!unlocked && (
              <span className="text-lg md:text-xl text-primary/40 dark:text-[#f4d5ad]/40">🔒</span>
            )}

            <span
              className="text-xl md:text-2xl font-bold font-typewriter"
              style={{ color: unlocked ? color : undefined }}
            >
              {index + 1}
            </span>
            <span
              className="text-[8px] md:text-[9px] font-mono leading-tight text-center px-1 mt-0.5"
              style={{ color: unlocked ? color : undefined }}
            >
              {rarity}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default RarityGrid;
