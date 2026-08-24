import { useRef, useState } from 'react';
import { animate, m, useMotionValue } from 'framer-motion';
import { useSettings } from '../../../lib/settings';

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
  const [result, setResult] = useState<Side | null>(null);
  const [choice, setChoice] = useState<Side | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const turnsRef = useRef(0);
  // Mirror of the visible face for imperative math without effect churn.
  const faceRef = useRef<Side>('heads');

  const call = (side: Side) => {
    if (flipping) return;
    setChoice(side);
    setFlipping(true);
    setResult(null);

    const outcome: Side = Math.random() < 0.5 ? 'heads' : 'tails';
    // Full spins plus a half-turn when the visible face must change.
    turnsRef.current += settings.reduceMotion ? 0 : 6;
    const target =
      turnsRef.current * 360 +
      ((outcome !== faceRef.current ? 180 : 0) - (rotateY.get() % 360) + 360) % 360;

    animate(rotateY, rotateY.get() + target, {
      duration: settings.reduceMotion ? 0.05 : 1.8,
      ease: [0.15, 0.7, 0.25, 1],
      onComplete: () => {
        faceRef.current = outcome;
        turnsRef.current = 0;
        setFlipping(false);
        setResult(outcome);
        if (outcome === side) {
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
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ perspective: '900px' }} className="h-40 w-40">
        <m.div
          className="relative h-full w-full"
          style={{ rotateY, transformStyle: 'preserve-3d' }}
          aria-live="polite"
          aria-label={result ? `Coin shows ${result}` : 'Coin'}
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
            {side === 'heads' ? 'Heads' : 'Tails'}
          </button>
        ))}
      </div>

      <p className="h-5 font-mono text-sm" role="status">
        {result && !flipping && (
          choice === result ? (
            <span className="text-green-600 dark:text-green-400">Called it — it&apos;s {result}!</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">It landed {result}. Streak reset.</span>
          )
        )}
      </p>

      <p className="font-mono text-xs text-primary/50 dark:text-[#f4d5ad]/50">
        Streak {streak} · Best {best}
      </p>
    </div>
  );
};

export default CoinFlip;
