import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';

const MILESTONES = [25, 50, 75, 100];
const KEY = 'completionMilestones:v1';
const SIZE = 96;
const STROKE = 8;

function reached(): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markReached(list: number[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

const CompletionRing = ({ distinctCaught, totalRarities }: { distinctCaught: number; totalRarities: number }) => {
  const pct = Math.min(100, Math.floor((distinctCaught / Math.max(totalRarities, 1)) * 100));
  const [burst, setBurst] = useState<number | null>(null);

  useEffect(() => {
    const already = reached();
    const milestone = MILESTONES.find((m) => pct >= m && !already.includes(m));
    if (milestone === undefined) return;
    markReached([...already, milestone]);
    setBurst(milestone);
    const t = window.setTimeout(() => setBurst(null), 1800);
    return () => window.clearTimeout(t);
  }, [pct]);

  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center gap-4 mb-4 relative" role="status" aria-label={`Collection ${pct}% complete`}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          fill="none"
          stroke="#c98a6e"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="font-mono text-sm text-white/85">
        <span className="text-lg font-bold">{distinctCaught}</span>
        <span className="text-white/40"> / {totalRarities} · </span>
        <span>{pct}%</span>
      </div>
      <AnimatePresence>
        {burst !== null && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            aria-label={`${burst}% collection milestone reached`}
          >
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              return (
                <m.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: ['#c98a6e', '#f4d5ad', '#7dd3fc', '#fbbf24'][i % 4] }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(angle) * 90, y: Math.sin(angle) * 90, opacity: 0 }}
                  transition={{ duration: 1.1 + (i % 5) * 0.08, ease: 'easeOut' }}
                />
              );
            })}
            <m.span
              className="font-mono font-bold text-sm bg-black/60 px-3 py-1 rounded-lg"
              initial={{ scale: 0.6 }}
              animate={{ scale: [0.6, 1.15, 1] }}
            >
              🎉 {burst}% collected!
            </m.span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompletionRing;
