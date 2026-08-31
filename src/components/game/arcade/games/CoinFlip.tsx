import { ARCADE, flip, play, start, guess } from "../../../../lib/arcade-stubs";
import { db } from "../../../../lib/db";
import { useRef, useState } from 'react';
import { animate, m, useMotionValue } from 'framer-motion';

import { useSettings } from '../../../../lib/settings';

type Side = 'heads' | 'tails';

const Face = ({ side }: { side: Side }) => (
  <div
    className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-[#F5E6CA] shadow-inner"
    style={{
      background: side === 'heads' ? 'radial-gradient(circle at 35% 30%, #E8C36A, #C9962E)' : '#B8862A',
      backfaceVisibility: 'hidden',
    }}
  >
    <span className="font-cursive text-5xl font-bold text-[#5D3A1A]">
      {side === 'heads' ? 'H' : 'T'}
    </span>
    <span className="absolute bottom-3 font-mono text-[10px] uppercase tracking-widest text-[#5D3A1A]/70">
      {side}
    </span>
  </div>
);

const CoinFlip = () => {
  const { settings } = useSettings();
  const rotateY = useMotionValue(0);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ landed: Side; won: boolean; net: number } | null>(null);
  const [choice, setChoice] = useState<Side | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const turnsRef = useRef(0);
  // Mirror of the visible face for imperative math without effect churn.
  const faceRef = useRef<Side>('heads');

  const call = (side: Side) => {
    if (flipping) return;
    setChoice(side);
    setFlipping(true);
    setResult(null);
    setError(null);

    flip({ choice: side })
      .then((res) => {
        turnsRef.current += settings.reduceMotion ? 0 : 6;
        const needed = res.landed !== faceRef.current ? 180 : 0;
        const delta =
          turnsRef.current * 360 + ((needed - (rotateY.get() % 360)) % 360 + 360) % 360;

        animate(rotateY, rotateY.get() + delta, {
          duration: settings.reduceMotion ? 0.05 : 1.8,
          ease: [0.15, 0.7, 0.25, 1],
          onComplete: () => {
            faceRef.current = res.landed as Side;
            turnsRef.current = 0;
            setFlipping(false);
            setResult({ landed: res.landed as Side, won: res.won, net: res.net });
            if (res.won) {
              setStreak((s) => {
                const next = s + 1;
                setBest((b) => Math.max(b, next));
                return next;
              });
            } else {
              setStreak(0);
            }
          },
        });
      })
      .catch((err: unknown) => {
        setFlipping(false);
        setError(err instanceof Error ? err.message : 'Flip failed');
      });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ perspective: '900px' }} className="h-36 w-36 sm:h-40 sm:w-40">
        <m.div
          className="relative h-full w-full"
          style={{ rotateY, transformStyle: 'preserve-3d' }}
          aria-live="polite"
          aria-label={result ? `Coin shows ${result.landed}` : 'Coin'}
        >
          <Face side="heads" />
          <div style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }} className="absolute inset-0 rounded-full">
            <Face side="tails" />
          </div>
        </m.div>
      </div>

      <div className="flex gap-3">
        {(['heads', 'tails'] as Side[]).map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => call(side)}
            disabled={flipping}
            className={`cursor-pointer rounded-xl px-8 py-3 font-mono text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
              choice === side
                ? 'bg-primary text-bg dark:bg-accent dark:text-[#1a120b]'
                : 'bg-secondary/30 dark:bg-secondary/10 border border-primary/20 dark:border-[#f4d5ad]/20 text-primary dark:text-[#f4d5ad] hover:border-accent'
            }`}
          >
            {side === 'heads' ? `Heads (${ARCADE.coinflip.cost})` : `Tails (${ARCADE.coinflip.cost})`}
          </button>
        ))}
      </div>

      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
        {!error && result && (
          result.won ? (
            <span className="text-green-600 dark:text-green-400">Called it — it&apos;s {result.landed}! +{result.net} LB</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">It landed {result.landed}. {ARCADE.coinflip.cost} LB gone.</span>
          )
        )}
        {!error && !result && flipping && <span className="text-primary/50 dark:text-[#f4d5ad]/50">In the air...</span>}
      </p>

      <p className="font-mono text-xs text-primary/50 dark:text-[#f4d5ad]/50">
        Streak {streak} · Best {best}
      </p>
    </div>
  );
};

export default CoinFlip;
