import { m } from 'framer-motion';
import { RARITIES, RARITY_COLORS } from '../lib/rarities';

interface RarityGridProps {
  rarityCounts: Record<string, number>;
  onRarityClick: (rarity: string, index: number) => void;
  isLoading: boolean;
  totalRarities: number;
}

const RarityGrid = ({ rarityCounts, onRarityClick, isLoading, totalRarities }: RarityGridProps) => {
  const visibleRarities = RARITIES.slice(0, totalRarities);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 w-full">
        {visibleRarities.map((rarity) => (
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
      {visibleRarities.map((rarity, index) => {
        const count = rarityCounts[rarity] || 0;
        const unlocked = count > 0;
        const color = RARITY_COLORS[rarity] || '#9CA3AF';

        return (
          <m.button
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
              relative aspect-square rounded-2xl flex flex-col items-center justify-center
              border-2 cursor-pointer backdrop-blur-sm transition-all duration-300
              ${unlocked
                ? 'active:scale-95'
                : 'opacity-30 grayscale-[1] cursor-not-allowed bg-black/20 border-white/5'
              }
            `}
            style={{
              borderColor: unlocked ? `${color}40` : undefined,
              backgroundColor: unlocked ? `${color}10` : undefined,
              boxShadow: unlocked ? `0 0 20px ${color}20` : undefined,
            }}
            title={unlocked ? `${rarity} (Count: ${count})` : 'Locked'}
          >
            {/* Ambient Glow for unlocked */}
            {unlocked && (
              <div 
                className="absolute inset-0 rounded-2xl opacity-20"
                style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent)` }}
              />
            )}
            {/* Count badge */}
            {unlocked && count > 0 && (
              <m.span
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15, delay: index * 0.03 + 0.2 }}
                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold font-mono text-white px-1 z-10"
                style={{ backgroundColor: color }}
              >
                {count}
              </m.span>
            )}

            {/* Lock icon for locked rarities */}
            {!unlocked && (
              <span className="text-xl md:text-2xl opacity-50">✨</span>
            )}

            <span
              className="text-lg md:text-xl font-bold font-typewriter"
              style={{ color: unlocked ? color : '#4B5563' }}
            >
              {index + 1}
            </span>
            <span
              className="text-[8px] md:text-[9px] font-mono leading-tight text-center px-1 mt-0.5"
              style={{ color: unlocked ? color : undefined }}
            >
              {rarity}
            </span>
          </m.button>
        );
      })}
    </div>
  );
};

export default RarityGrid;
