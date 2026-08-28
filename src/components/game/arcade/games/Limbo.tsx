import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { ARCADE } from '../../../lib/convex-constants/arcade';

interface LimboResult {
  roll: number;
  target: number;
  won: boolean;
  net: number;
}

const QUICK = [1.5, 2, 5, 10];

const Limbo = () => {
  const play = useMutation(api.arcade.playLimbo);
  const [target, setTarget] = useState(2);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LimboResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needed = Math.round((ARCADE.limbo.payoutPct / target) * 100);
  const valid = target >= ARCADE.limbo.minTarget && target <= ARCADE.limbo.maxTarget;

  const roll = () => {
    if (busy || !valid) return;
    setBusy(true);
    setResult(null);
    setError(null);
    setTimeout(() => {
      const rollVal = Math.random() * 100;
      const won = rollVal < target;
      setResult({ roll: rollVal, target, won, net: won ? Math.round(100 / target) : -ARCADE.limbo.cost });
      setBusy(false);
    }, 500);
  };

  const rollPct = result ? Math.round(result.roll * 10000) / 100 : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <m.div
        key={result ? `r${result.roll}` : 'idle'}
        initial={result ? { scale: 0.75, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        className={`flex h-28 w-40 flex-col items-center justify-center rounded-2xl border-2 font-mono shadow-lg ${
          result
            ? result.won
              ? 'border-green-500/60 bg-green-500/10 text-green-600 shadow-[0_0_32px_rgba(39,174,96,0.25)] dark:text-green-400'
              : 'border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400'
            : 'border-[#f4d5ad]/25 bg-[#f4d5ad]/5 text-[#f4d5ad]/80'
        }`}
        aria-live="polite"
      >
        {result ? (
          <>
            <span className="text-3xl font-bold">{rollPct?.toFixed(2)}</span>
            <span className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
              needed &lt; {needed}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold">x{target}</span>
        )}
      </m.div>

      <div className="flex w-full max-w-xs items-center gap-2">
        <span className="font-mono text-lg text-accent dark:text-[#c98a6e]">x</span>
        <input
          type="number"
          min={ARCADE.limbo.minTarget}
          max={ARCADE.limbo.maxTarget}
          step={0.1}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          disabled={busy}
          aria-label="Target multiplier"
          className="w-full rounded-lg border border-[#f4d5ad]/25 bg-[#f4d5ad]/5 px-3 py-2 font-mono text-sm font-bold text-[#f4d5ad] outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setTarget(q)}
            disabled={busy}
            className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all disabled:opacity-50 ${
              target === q
                ? 'bg-accent text-[#1a120b]'
                : 'border border-[#f4d5ad]/25 bg-[#f4d5ad]/5 text-[#f4d5ad]/80 hover:border-accent'
            }`}
          >
            x{q}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={roll}
        disabled={busy || !valid}
        className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {busy ? 'Rolling...' : `Roll (${ARCADE.limbo.cost} LB)`}
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
                  Landed under — x{result.target}! +{result.net} LB
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Overshot. {ARCADE.limbo.cost} LB gone.</span>
              )
            )}
            {!error && !result && !busy && (
              <span className="text-primary/50 dark:text-[#f4d5ad]/50">
                Win chance {needed}% · pays x{target}
              </span>
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

export default Limbo;
