import { ARCADE, PLINKO_MULTS, WHEEL_MULTS, WHEEL_LABELS, SLOTS_TRIPLE_PAY, playWheel, playPlinko } from "../../../lib/arcade-stubs";
import { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../../../lib/settings';

const GLYPH: Record<string, string> = {
  SEVEN: '7',
  GEM: '◆',
  BOLT: 'ϟ',
  MOON: '☾',
  BELL: '♪',
  STAR: '★',
};

interface SlotsResult {
  reels: string[];
  mult: number;
  net: number;
}

const Slots = () => {
  const { settings } = useSettings();
  const [display, setDisplay] = useState<string[]>(['7', '◆', '★']);
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SlotsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearInterval(t)), []);

  const spin = () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setError(null);

    setSpinning([true, true, true]);
    const resReels = ['7', '◆', '★']; // placeholder
    resReels.forEach((symbol, i) => {
      const stopAt = settings.reduceMotion ? 150 : 700 + i * 450;
      setTimeout(() => {
        setDisplay((d) => d.map((old, j) => (j === i ? symbol : old)));
        setSpinning((s) => {
          const n = [...s]; n[i] = false;
          if (n.every((v) => !v)) {
            setBusy(false);
            const won = resReels.every((r) => r === resReels[0]);
            setResult({ reels: resReels, mult: won ? 3 : 1, net: won ? 30 : -ARCADE.slots.cost });
          }
          return n;
        });
      }, stopAt);
    });
  };

  const isSpinning = spinning.some(Boolean);
  const won = result ? result.mult > 0 : false;
  const jackpot = result ? result.reels.every((r) => r === result.reels[0]) : false;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#f4d5ad]/20 bg-[#0d0906]/80 p-3 shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]">
        {display.map((glyph, i) => (
          <div
            key={i}
            className={`flex h-20 w-16 items-center justify-center rounded-lg border font-mono text-3xl font-bold transition-all duration-200 sm:h-24 sm:w-20 sm:text-4xl ${
              spinning[i]
                ? 'border-[#f4d5ad]/15 bg-[#f4d5ad]/5 text-[#f4d5ad]/50 blur-[2px]'
                : jackpot
                  ? 'border-accent/70 bg-accent/10 text-accent'
                  : won
                    ? 'border-green-500/60 bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'border-[#f4d5ad]/25 bg-[#f4d5ad]/10 text-[#f4d5ad]/85'
            }`}
            aria-label={`Reel ${i + 1}: ${result ? result.reels[i] : 'spinning'}`}
          >
            <AnimatePresence mode="wait">
              <m.span
                key={glyph + String(spinning[i])}
                initial={{ y: spinning[i] ? -14 : 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: spinning[i] ? 0.06 : 0.22 }}
              >
                {glyph}
              </m.span>
            </AnimatePresence>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={isSpinning || busy}
        className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {isSpinning || busy ? 'Spinning...' : `Spin (${ARCADE.slots.cost} LB)`}
      </button>

      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
        {!error && result && (
          won ? (
            <span className="text-green-600 dark:text-green-400">
              {jackpot ? 'TRIPLE MATCH!' : 'Nice pair'} x{result.mult} — +{result.net} LB
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">No match. {ARCADE.slots.cost} LB gone.</span>
          )
        )}
        {!error && !result && !isSpinning && !busy && (
          <span className="text-primary/50 dark:text-[#f4d5ad]/50">
            Triple 7 pays x{SLOTS_TRIPLE_PAY.SEVEN} · any pair x1.5
          </span>
        )}
        {!error && !result && (isSpinning || busy) && (
          <span className="text-primary/50 dark:text-[#f4d5ad]/50">Spinning...</span>
        )}
      </p>
    </div>
  );
};

export default Slots;
