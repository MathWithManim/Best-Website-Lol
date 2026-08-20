import { m } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RARITY_COLORS, RARITY_INDEX } from '../lib/rarities';

const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const leaderboard = useQuery(api.leaderboard.getLeaderboard);

  if (!leaderboard) {
    return (
      <div className="w-full max-w-sm mx-auto mt-8">
        <h3 className="text-lg font-sans font-bold text-primary dark:text-[#f4d5ad] text-center mb-4">Leaderboard</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-primary/5 dark:bg-[#f4d5ad]/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto mt-8">
        <h3 className="text-lg font-sans font-bold text-primary dark:text-[#f4d5ad] text-center mb-4">Leaderboard</h3>
        <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">No rolls yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-8">
      <m.h3
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-lg font-sans font-bold text-primary dark:text-[#f4d5ad] text-center mb-4"
      >
        Leaderboard
      </m.h3>
      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry, i) => {
          const color = RARITY_COLORS[entry.rarity] || '#9CA3AF';
          return (
            <m.div
              key={entry.username + entry.rarity}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-[#f4d5ad]/5 border border-primary/10 dark:border-[#f4d5ad]/10"
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
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-bold text-primary dark:text-[#f4d5ad] truncate">{entry.username}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold" style={{ color }}>{entry.rarity}</div>
                <div className="text-[10px] font-mono text-primary/40 dark:text-[#f4d5ad]/40">#{RARITY_INDEX[entry.rarity] + 1}</div>
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
