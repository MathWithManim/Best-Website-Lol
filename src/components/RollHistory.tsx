import { useState } from 'react';
import { RARITY_COLORS } from '../lib/rarities';
import { getRollHistory } from '../lib/rollHistory';

const RollHistory = () => {
  const [open, setOpen] = useState(false);
  const entries = getRollHistory();

  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Show your last pulls from this browser"
        aria-expanded={open}
        className="w-full py-2 font-mono text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
      >
        📜 Recent pulls ({entries.length}) {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {entries.map((e, i) => {
            const color = RARITY_COLORS[e.rarity] || '#9CA3AF';
            return (
              <div
                key={`${e.at}-${i}`}
                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 font-mono text-xs"
              >
                <span className="font-bold" style={{ color }}>{e.rarity}</span>
                <span className="text-white/40">#{e.index + 1}</span>
                <span className="text-white/30">
                  {new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RollHistory;
