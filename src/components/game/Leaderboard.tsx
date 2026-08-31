import { db, leaderboard, users } from "../../db";
import { useQuery, api } from '../../lib/lib/db';
import { useState } from 'react';
import { m } from 'framer-motion';


import { RARITY_COLORS } from '../../lib/rarities';
import { fmtCompact } from '../../lib/format';
import { useUser } from '../../lib/useUser';

const MEDALS = ['🥇', '🥈', '🥉'];
const spring = { type: 'spring', damping: 1.0, stiffness: 300 } as const;

const Leaderboard = () => {
  const me = useUser();
  const boards = useQuery(api.leaderboard.getWeeklyLeaderboard);
  const [tier, setTier] = useState<number | null>(null);

  if (boards === undefined) {
    return (
      <div className="w-full max-w-sm mx-auto mt-8">
        <h3 className="text-lg font-sans font-bold text-primary dark:text-[#f4d5ad] text-center mb-4">Weekly Race</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-primary/5 dark:bg-[#f4d5ad]/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto mt-8">
        <h3 className="text-lg font-sans font-bold text-primary dark:text-[#f4d5ad] text-center mb-4">Weekly Race</h3>
        <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">No pulls this week yet. Be the first!</p>
      </div>
    );
  }

  const active = tier === null ? boards[0] : boards.find((b) => b.tier === tier) ?? boards[0];

  return (
    <div className="w-full max-w-sm mx-auto mt-8">
      <m.h3
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={spring}
        className="text-lg font-sans font-bold text-primary dark:text-[#f4d5ad] text-center mb-3"
      >
        Weekly Race
      </m.h3>

      {boards.length > 1 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-4" role="tablist" aria-label="Rebirth tiers">
          {boards.map((b) => (
            <button
              key={b.tier}
              role="tab"
              aria-selected={active.tier === b.tier}
              onClick={() => setTier(b.tier)}
              title={`Show the ${b.label} board`}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-colors cursor-pointer ${
                active.tier === b.tier
                  ? 'bg-primary dark:bg-accent text-bg dark:text-[#1a120b]'
                  : 'bg-primary/5 dark:bg-[#f4d5ad]/5 text-primary/70 dark:text-[#f4d5ad]/70 border border-primary/10 dark:border-[#f4d5ad]/10 hover:opacity-80'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {active.entries.length === 0 ? (
        <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">No scores on this board yet.</p>
      ) : (
        <div className="space-y-2">
          {active.entries.map((entry, i) => {
            const color = RARITY_COLORS[entry.bestRarity] || '#9CA3AF';
            return (
              <m.div
                key={entry.username}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-[#f4d5ad]/5 border border-primary/10 dark:border-[#f4d5ad]/10 ${entry.username === me?.username ? 'ring-2 ring-accent dark:ring-[#c98a6e]' : ''}`}
                style={i < 3 ? { borderColor: `${color}40`, boxShadow: `0 0 8px ${color}15` } : {}}
              >
                <span className="text-lg font-bold w-8 text-center">
                  {i < 3 ? MEDALS[i] : <span className="text-sm text-primary/40 dark:text-[#f4d5ad]/40 font-mono">#{i + 1}</span>}
                </span>
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${entry.username}`}
                  alt={`${entry.username}'s avatar`}
                  className="w-8 h-8 rounded-full bg-bg dark:bg-[#2d1e14]"
                />
                <div className="flex-1 min-w-0 truncate font-mono text-sm font-bold text-primary dark:text-[#f4d5ad]">
                  {entry.username}{entry.username === me?.username && <span className="text-accent dark:text-[#c98a6e]"> (you)</span>}
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-primary dark:text-[#f4d5ad]">{fmtCompact(entry.score)}</div>
                  <div className="text-[10px] font-mono" style={{ color }}>{entry.bestRarity}</div>
                </div>
              </m.div>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-center text-[10px] font-mono text-primary/30 dark:text-[#f4d5ad]/30">
        Resets every Monday 00:00 UTC
      </p>
    </div>
  );
};

export default Leaderboard;
