import { m } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RARITY_COLORS, RARITY_INDEX } from '../lib/rarities';

function timeAgo(ts: number): string {
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const RecentWins = () => {
  const wins = useQuery(api.leaderboard.getRecentWins);

  if (!wins || wins.length === 0) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto mb-4 px-4 py-2 rounded-xl bg-black/20 dark:bg-black/40 border border-white/5 flex items-center gap-2 overflow-x-auto whitespace-nowrap"
      role="status"
      aria-label="Recent top pulls by other players"
    >
      <span aria-hidden>🔥</span>
      {wins.map((w) => {
        const color = RARITY_COLORS[w.rarity] || '#9CA3AF';
        return (
          <span key={`${w.username}-${w.timestamp}`} className="font-mono text-xs text-white/70 shrink-0">
            <span className="text-white/90">{w.username}</span>
            {' pulled '}
            <span className="font-bold" style={{ color }} title={`Rarity #${RARITY_INDEX[w.rarity] + 1}`}>
              {w.rarity}
            </span>
            <span className="text-white/40"> · {timeAgo(w.timestamp)}</span>
          </span>
        );
      })}
    </m.div>
  );
};

export default RecentWins;
