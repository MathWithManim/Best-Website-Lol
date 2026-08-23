import { useState } from 'react';
import { getRollHistory } from '../lib/rollHistory';
import { computeLuckStats, luckVerdict } from '../lib/luck';
import { RARITY_COLORS } from '../lib/rarities';
import { fmtCompact } from '../lib/format';

const toneClass = {
  lucky: 'text-emerald-400',
  average: 'text-amber-300',
  unlucky: 'text-red-400',
};

const LuckPanel = () => {
  const [open, setOpen] = useState(false);
  const stats = computeLuckStats(getRollHistory());
  const verdict = luckVerdict(stats.luckRatio);
  const maxRolls = Math.max(1, ...stats.perDay.map((d) => d.rolls));
  const enoughData = stats.sampleSize >= 10;

  return (
    <div className="w-full max-w-sm mx-auto mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={enoughData ? 'Your pull-luck analytics' : 'Keep rolling — luck tracking needs at least 10 pulls'}
        className="w-full py-2 font-mono text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
      >
        🍀 Luck tracker {stats.sampleSize > 0 ? `· ${stats.luckRatio.toFixed(2)}×` : ''} {open ? '▾' : '▸'}
      </button>

      {open && (
        <div className="rounded-xl bg-black/20 border border-white/5 p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className={`font-mono text-2xl font-bold ${toneClass[verdict.tone]}`}>
              {stats.luckRatio.toFixed(2)}×
            </span>
            <span className={`font-mono text-xs font-bold ${toneClass[verdict.tone]}`}>{verdict.label}</span>
          </div>

          {enoughData ? (
            <p className="font-mono text-[11px] text-white/50 leading-relaxed">
              Your pulls average {fmtCompact(stats.actualEV)} LB vs an expected{' '}
              {fmtCompact(stats.expectedEV)} LB across tracked rolls.
            </p>
          ) : (
            <p className="font-mono text-[11px] text-white/40 leading-relaxed">
              Tracking starts once you have 10+ pulls ({stats.sampleSize}/10 so far).
            </p>
          )}

          {stats.bestPull && (
            <p className="font-mono text-[11px] text-white/60">
              Best pull:{' '}
              <span className="font-bold" style={{ color: RARITY_COLORS[stats.bestPull.rarity] || '#9CA3AF' }}>
                {stats.bestPull.rarity}
              </span>{' '}
              <span className="text-white/30">#{stats.bestPull.index + 1}</span>
            </p>
          )}

          <div>
            <p className="font-mono text-[10px] text-white/30 mb-1">Last 14 days</p>
            <div className="flex items-end gap-1 h-12">
              {stats.perDay.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.rolls} rolls`}
                  className="flex-1 rounded-t bg-accent dark:bg-[#c98a6e]"
                  style={{ height: `${Math.max(4, (d.rolls / maxRolls) * 100)}%`, opacity: d.rolls === 0 ? 0.25 : 1 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckPanel;
