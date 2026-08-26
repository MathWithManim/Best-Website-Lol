import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { ARCADE } from '../../../../convex/shared';

type Dir = 'over' | 'under';

interface DiceResult {
  roll: number;
  mult: number;
  won: boolean;
  net: number;
}

const Dice = () => {
  const play = useMutation(api.arcade.playDice);
  const [target, setTarget] = useState(50);
  const [dir, setDir] = useState<Dir>('over');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chance = dir === 'over' ? 100 - target : target - 1;
  const mult = Math.round((ARCADE.dice.payoutPct / (chance / 100)) * 100) / 100;

  const roll = () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setError(null);
    play({ target, direction: dir })
      .then((res) => setResult({ roll: res.roll, mult: res.mult, won: res.won, net: res.net }))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Roll failed'))
      .finally(() => setBusy(false));
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <m.div
        key={result ? `r${result.roll}` : 'idle'}
        initial={result ? { scale: 0.7, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className={`flex h-28 w-28 items-center justify-center rounded-2xl border-2 font-mono text-4xl font-bold shadow-lg ${
          result
            ? result.won
              ? 'border-green-500/60 bg-green-500/10 text-green-600 shadow-[0_0_32px_rgba(39,174,96,0.25)] dark:text-green-400'
              : 'border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400'
            : 'border-[#f4d5ad]/25 bg-[#f4d5ad]/5 text-[#f4d5ad]/80'
        }`}
        aria-live="polite"
      >
        {result ? result.roll : '??'}
      </m.div>

      <div className="w-full max-w-sm">
        <div className="mb-1 flex items-center justify-between font-mono text-xs">
          <span className="text-primary/60 dark:text-[#f4d5ad]/60">
            Roll {dir} <span className="font-bold text-accent dark:text-[#c98a6e]">{target}</span>
          </span>
          <span className="text-primary/60 dark:text-[#f4d5ad]/60">
            <span className="font-bold text-accent dark:text-[#c98a6e]">{chance}%</span> chance ·{' '}
            <span className="font-bold text-accent dark:text-[#c98a6e]">x{mult}</span>
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={98}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          disabled={busy}
          aria-label="Roll target"
          className="w-full cursor-pointer accent-[#e09f58]"
        />
      </div>

      <div className="flex gap-2">
        {(['over', 'under'] as Dir[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDir(d)}
            disabled={busy}
            className={`cursor-pointer rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 ${
              dir === d
                ? 'bg-accent text-[#1a120b]'
                : 'border border-[#f4d5ad]/25 bg-[#f4d5ad]/5 text-[#f4d5ad]/80 hover:border-accent'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={roll}
        disabled={busy}
        className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {busy ? 'Rolling...' : `Roll (${ARCADE.dice.cost} LB)`}
      </button>

      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          <m.span
            key={error ?? result?.roll ?? 'idle'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
            {!error && result && (
              result.won ? (
                <span className="text-green-600 dark:text-green-400">
                  Rolled {result.roll} — won x{result.mult}! +{result.net} LB
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Rolled {result.roll}. {ARCADE.dice.cost} LB gone.</span>
              )
            )}
            {!error && !result && !busy && (
              <span className="text-primary/50 dark:text-[#f4d5ad]/50">Set your target and roll.</span>
            )}
            {!error && !result && busy && (
              <span className="text-primary/50 dark:text-[#f4d5ad]/50">Rolling...</span>
            )}
          </m.span>
        </AnimatePresence>
      </p>
    </div>
  );
};

export default Dice;
