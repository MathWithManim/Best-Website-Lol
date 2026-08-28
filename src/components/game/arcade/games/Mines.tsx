import { db } from "../../../../db";
import { ARCADE } from "../../../../lib/convex-constants/arcade";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';


interface MinesResult {
  mines: number[];
  picks: number[];
  mult: number;
  won: boolean;
  net: number;
}

function multForPicks(k: number): number {
  const { tiles, mines, payoutPct } = ARCADE.mines;
  const safe = tiles - mines;
  let total = 1;
  let safeC = 1;
  for (let i = 0; i < k; i++) {
    total = (total * (tiles - i)) / (i + 1);
    safeC = (safeC * (safe - i)) / (i + 1);
  }
  return Math.round((payoutPct * total) / safeC * 100) / 100;
}

const Mines = () => {
  const play = useMutation(api.arcade.playMines);
  const [picked, setPicked] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MinesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (i: number) => {
    if (busy || result) return;
    setPicked((p) =>
      p.includes(i) ? p.filter((x) => x !== i) : p.length < ARCADE.mines.maxPicks ? [...p, i] : p
    );
  };

  const reveal = () => {
    if (busy || picked.length < 1) return;
    setBusy(true);
    setError(null);
    play({ picks: picked })
      .then((res) => setResult({ mines: res.mines, picks: res.picks, mult: res.mult, won: res.won, net: res.net }))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Reveal failed'))
      .finally(() => setBusy(false));
  };

  const reset = () => {
    setResult(null);
    setPicked([]);
    setError(null);
  };

  const mineSet = result ? new Set(result.mines) : null;
  const pickSet = new Set(picked);
  const wonPicks = result ? new Set(result.picks) : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: ARCADE.mines.tiles }, (_, i) => {
          const isPicked = pickSet.has(i);
          const revealedMine = mineSet?.has(i);
          const wasPick = wonPicks?.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={busy || !!result}
              aria-label={`Tile ${i + 1}${isPicked ? ', selected' : ''}`}
              aria-pressed={isPicked}
              className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 font-mono text-2xl transition-all duration-200 disabled:cursor-default sm:h-[4.5rem] sm:w-[4.5rem] ${
                result
                  ? revealedMine
                    ? 'border-red-500/70 bg-red-500/15 text-red-600 dark:text-red-400'
                    : wasPick
                      ? 'border-green-500/70 bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'border-[#f4d5ad]/15 bg-[#f4d5ad]/5 text-[#f4d5ad]/25'
                  : isPicked
                    ? 'border-accent bg-accent/15 text-accent scale-105'
                    : 'border-[#f4d5ad]/20 bg-[#f4d5ad]/5 text-[#f4d5ad]/40 hover:border-accent/50 hover:text-[#f4d5ad]/70'
              }`}
            >
              <AnimatePresence mode="wait">
                <m.span
                  key={`${i}-${result ? (revealedMine ? 'm' : wasPick ? 's' : 'e') : isPicked ? 'p' : 'e'}`}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  {result ? (revealedMine ? '✱' : wasPick ? '◆' : '·') : isPicked ? '◆' : '?'}
                </m.span>
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <p className="font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60">
        {result ? (
          <span className={result.won ? 'text-green-600 dark:text-green-400 font-bold' : ''}>
            {result.won ? `All safe — x${result.mult}! +${result.net} LB` : 'Mine hit. Stake gone.'}
          </span>
        ) : (
          <>
            {picked.length}/{ARCADE.mines.maxPicks} tiles marked · pays{' '}
            <span className="font-bold text-accent dark:text-[#c98a6e]">
              x{picked.length ? multForPicks(picked.length) : '—'}
            </span>
          </>
        )}
      </p>

      {result ? (
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 dark:bg-accent dark:text-[#1a120b]"
        >
          New round ({ARCADE.mines.cost} LB)
        </button>
      ) : (
        <button
          type="button"
          onClick={reveal}
          disabled={busy || picked.length < 1}
          className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
        >
          {busy ? 'Sweeping...' : `Reveal (${ARCADE.mines.cost} LB)`}
        </button>
      )}

      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
        {!error && busy && <span className="text-primary/50 dark:text-[#f4d5ad]/50">Sweeping...</span>}
      </p>
    </div>
  );
};

export default Mines;
