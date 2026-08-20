import { memo } from 'react';
import { m } from 'framer-motion';
import { RARITIES, RARITY_COLORS } from '../lib/rarities';
import { useSettings } from '../lib/settings';

interface RarityGridProps {
  rarityCounts: Record<string, number>;
  onRarityClick: (rarity: string, index: number) => void;
  isLoading: boolean;
  totalRarities: number;
}

interface GridCellProps {
  rarity: string;
  index: number;
  count: number;
  unlocked: boolean;
  color: string;
  compact: boolean;
  showName: boolean;
  skipEntrance: boolean;
  onClick: (rarity: string, index: number) => void;
}

const GridCell = memo(function GridCell({ rarity, index, count, unlocked, color, compact, showName, skipEntrance, onClick }: GridCellProps) {
  const delay = Math.min(index * 0.02, 0.6); // cap the entrance stagger so big grids load fast

  return (
    <m.button
      initial={skipEntrance ? false : { opacity: 0, scale: 0.8 }}
      whileInView={skipEntrance ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      whileHover={unlocked ? { scale: 1.08, y: -4, boxShadow: `0 8px 24px ${color}35` } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
      onClick={() => unlocked && onClick(rarity, index)}
      disabled={!unlocked}
      className={`
        relative aspect-square rounded-2xl flex flex-col items-center justify-center
        border-2 cursor-pointer transition-all duration-300
        ${compact ? 'gap-0.5' : 'gap-1'}
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
      {/* Ambient glow for unlocked */}
      {unlocked && (
        <div
          className="absolute inset-0 rounded-2xl opacity-20"
          style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent)` }}
        />
      )}
      {/* Count badge */}
      {unlocked && count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold font-mono text-white px-1 z-10"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      )}

      {/* Lock icon for locked rarities */}
      {!unlocked && <span className="text-xl md:text-2xl opacity-50">✨</span>}

      <span
        className={`font-bold font-typewriter ${compact ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}
        style={{ color: unlocked ? color : '#4B5563' }}
      >
        {index + 1}
      </span>
      {showName && (
        <span
          className={`font-mono leading-tight text-center px-1 ${compact ? 'text-[7px] md:text-[8px]' : 'text-[8px] md:text-[9px]'}`}
          style={{ color: unlocked ? color : undefined }}
        >
          {rarity}
        </span>
      )}
    </m.button>
  );
});

const RarityGrid = ({ rarityCounts, onRarityClick, isLoading, totalRarities }: RarityGridProps) => {
  const { settings } = useSettings();
  const visibleRarities = RARITIES.slice(0, totalRarities);
  const skipEntrance = totalRarities > 150;
  const gridClass = settings.compactGrid
    ? 'grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-1.5 md:gap-2 w-full'
    : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 w-full';

  if (isLoading) {
    return (
      <div className={gridClass}>
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
    <div className={gridClass}>
      {visibleRarities.map((rarity, index) => {
        const count = rarityCounts[rarity] || 0;
        const unlocked = count > 0;
        const color = RARITY_COLORS[rarity] || '#9CA3AF';

        return (
          <GridCell
            key={rarity}
            rarity={rarity}
            index={index}
            count={count}
            unlocked={unlocked}
            color={color}
            compact={settings.compactGrid}
            showName={settings.showRarityNames}
            onClick={onRarityClick}
            skipEntrance={skipEntrance}
          />
        );
      })}
    </div>
  );
};

export default RarityGrid;