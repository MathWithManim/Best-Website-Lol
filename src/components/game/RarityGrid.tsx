import { memo, useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { RARITIES, RARITY_COLORS, rarityChancePercent } from '../../lib/rarities';
import { useSettings } from '../../lib/settings';

const PAGE_SIZE = 50;

interface RarityGridProps {
  rarityCounts: Record<string, number>;
  discovered?: Record<string, boolean>;
  onRarityClick: (rarity: string, index: number) => void;
  isLoading: boolean;
  totalRarities: number;
}

interface GridCellProps {
  rarity: string;
  index: number;
  count: number;
  accessible: boolean;
  color: string;
  compact: boolean;
  showName: boolean;
  onClick: (rarity: string, index: number) => void;
}

const GridCell = memo(function GridCell({ rarity, index, count, accessible, color, compact, showName, onClick }: GridCellProps) {
  return (
    <m.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      whileTap={accessible ? { scale: 0.95 } : undefined}
      onClick={() => accessible && onClick(rarity, index)}
      disabled={!accessible}
      title={accessible ? `${rarity}${count > 0 ? ` ×${count}` : ' (discovered)'}` : 'Locked'}
      className={`group relative aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-colors duration-300 ${compact ? 'gap-0.5' : 'gap-1'} ${
        accessible ? 'cursor-pointer active:scale-95' : 'opacity-40 grayscale-[1] cursor-not-allowed bg-black/20 border-white/5'
      }`}
      style={{
        borderColor: accessible ? `${color}40` : undefined,
        backgroundColor: accessible ? `${color}10` : undefined,
        boxShadow: accessible ? `0 0 20px ${color}20` : undefined,
      }}
    >
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 translate-y-1 rounded-lg bg-black/90 px-2 py-1 font-mono text-[10px] font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-0 group-hover:opacity-100"
      >
        {rarityChancePercent(index)}%
      </span>

      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold font-mono text-white px-1 z-10"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      )}

      {!accessible && <span className="text-xl md:text-2xl opacity-50">✨</span>}

      <span
        className={`font-bold font-typewriter ${compact ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`}
        style={{ color: accessible ? color : '#4B5563' }}
      >
        {index + 1}
      </span>
      {showName && (
        <span
          className={`font-mono leading-tight text-center px-1 ${compact ? 'text-[7px] md:text-[8px]' : 'text-[8px] md:text-[9px]'}`}
          style={{ color: accessible ? color : undefined }}
        >
          {rarity}
        </span>
      )}
    </m.button>
  );
});

const RarityGrid = ({ rarityCounts, discovered = {}, onRarityClick, isLoading, totalRarities }: RarityGridProps) => {
  const { settings } = useSettings();
  const [page, setPage] = useState(() => {
    const match = typeof window !== 'undefined' ? window.location.hash.match(/collection-(\d+)/) : null;
    return match ? Math.max(0, parseInt(match[1], 10) - 1) : 0;
  });
  const [dir, setDir] = useState(1);

  const pageCount = Math.max(1, Math.ceil(totalRarities / PAGE_SIZE));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#collection-${page + 1}`);
    }
  }, [page]);

  useEffect(() => {
    if (page >= pageCount) setPage(pageCount - 1);
  }, [pageCount, page]);

  const go = (delta: number) => {
    setDir(delta);
    setPage((p) => Math.min(pageCount - 1, Math.max(0, p + delta)));
  };

  const gridClass = settings.compactGrid
    ? 'grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-1.5 md:gap-2 w-full'
    : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 w-full';

  if (isLoading) {
    return (
      <div className={gridClass}>
        {RARITIES.slice(0, totalRarities).map((rarity) => (
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

  const start = page * PAGE_SIZE;
  const visible = RARITIES.slice(start, Math.min(start + PAGE_SIZE, totalRarities));

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={page}
          initial={{ opacity: 0, x: dir * 140, scale: 0.97 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -140, scale: 0.97 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={gridClass}
        >
          {visible.map((rarity, i) => {
            const index = start + i;
            const count = rarityCounts[rarity] || 0;
            const accessible = count > 0 || !!discovered[rarity];
            const color = RARITY_COLORS[rarity] || '#9CA3AF';

            return (
              <GridCell
                key={rarity}
                rarity={rarity}
                index={index}
                count={count}
                accessible={accessible}
                color={color}
                compact={settings.compactGrid}
                showName={settings.showRarityNames}
                onClick={onRarityClick}
              />
            );
          })}
        </m.div>
      </AnimatePresence>

      <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 p-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-xl">
        <button
          onClick={() => go(-1)}
          disabled={page === 0}
          aria-label="Previous collection page"
          title="Previous page"
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white/85 font-mono text-lg transition-all ${page === 0 ? 'opacity-25 cursor-default' : 'hover:bg-white/15 active:scale-90 cursor-pointer'}`}
        >
          ‹
        </button>
        <span className="font-mono text-[9px] text-white/50 leading-none py-0.5">
          {page + 1}/{pageCount}
        </span>
        <button
          onClick={() => go(1)}
          disabled={page >= pageCount - 1}
          aria-label="Next collection page"
          title="Next page"
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white/85 font-mono text-lg transition-all ${page >= pageCount - 1 ? 'opacity-25 cursor-default' : 'hover:bg-white/15 active:scale-90 cursor-pointer'}`}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default RarityGrid;
