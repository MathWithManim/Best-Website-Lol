import { db } from "../../../../db";
import { ARCADE } from "../../../../lib/convex-constants/arcade";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { useSettings } from '../../../../lib/settings';

interface CupsResult {
  ball: number;
  pick: number;
  net: number;
}

type Phase = 'idle' | 'shuffling' | 'picking' | 'reveal';

const CUP_X = [-72, 0, 72];

const Cups = () => {
  const { settings } = useSettings();
  const play = useMutation(api.arcade.playCups);
  const [phase, setPhase] = useState<Phase>('idle');
  const [shuffleOffsets, setShuffleOffsets] = useState([0, 0, 0]);
  const [result, setResult] = useState<CupsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shuffle = settings.reduceMotion
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        let swaps = 0;
        const interval = window.setInterval(() => {
          setShuffleOffsets(() => {
            const a = Math.floor(Math.random() * 3);
            let b = Math.floor(Math.random() * 3);
            if (b === a) b = (b + 1) % 3;
            return CUP_X.map((_, i) => (i === a ? CUP_X[b] : i === b ? CUP_X[a] : CUP_X[i]));
          });
          swaps += 1;
          if (swaps >= 7) {
            window.clearInterval(interval);
            setShuffleOffsets([CUP_X[0], CUP_X[1], CUP_X[2]]);
            resolve();
          }
        }, 160);
      });

  const begin = async () => {
    if (phase === 'shuffling') return;
    setPhase('shuffling');
    setError(null);
    setResult(null);
    await shuffle;
    setPhase('picking');
  };

  const pick = (i: number) => {
    if (phase !== 'picking') return;
    setPhase('reveal');
    play({ pick: i })
      .then((res) => setResult({ ball: res.ball, pick: res.pick, net: res.net }))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Round failed');
        setPhase('idle');
      });
  };

  const ballVisible = phase === 'idle' || phase === 'reveal';

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-40 items-end justify-center gap-6">
        <AnimatePresence>
          {ballVisible && phase === 'idle' && (
            <m.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(224,159,88,0.7)]"
              aria-hidden
            />
          )}
        </AnimatePresence>
        {CUP_X.map((x, i) => {
          const revealed = phase === 'reveal' && result?.ball === i;
          const chosen = result?.pick === i;
          const lift = revealed ? -34 : shuffleOffsets[i] !== x ? -10 : 0;
          return (
            <m.button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={phase !== 'picking'}
              animate={{ x: shuffleOffsets[i], y: lift }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              whileHover={phase === 'picking' ? { y: -14 } : undefined}
              className={`relative h-28 w-20 cursor-pointer rounded-t-2xl rounded-b-md border-2 transition-colors ${
                phase === 'reveal' && chosen
                  ? result?.ball === i
                    ? 'border-green-500/80 bg-green-500/20'
                    : 'border-red-500/80 bg-red-500/20'
                  : 'border-[#F5E6CA]/40 bg-gradient-to-b from-[#7D6608] to-[#524405] hover:border-[#F5E6CA]/80'
              } ${phase !== 'picking' && phase !== 'shuffling' ? '' : 'shadow-lg'}`}
              aria-label={`Cup ${i + 1}${phase === 'picking' ? ', choose this cup' : ''}`}
            >
              <span className="absolute left-1/2 top-2 h-2 w-10 -translate-x-1/2 rounded-full bg-[#F5E6CA]/30" />
            </m.button>
          );
        })}
      </div>

      {phase === 'reveal' && result && (
        <m.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-mono text-sm font-bold ${result.ball === result.pick ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          role="status"
          aria-live="polite"
        >
          {result.ball === result.pick
            ? `Ball found — +${result.net} LB`
            : `Ball was under cup ${result.ball + 1}. ${ARCADE.cups.cost} LB gone.`}
        </m.p>
      )}
      {error && (
        <p className="font-mono text-sm text-red-600 dark:text-red-400" role="status">{error}</p>
      )}

      <button
        type="button"
        onClick={begin}
        disabled={phase === 'shuffling'}
        className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {phase === 'idle' || phase === 'reveal'
          ? `Shuffle (${ARCADE.cups.cost} LB)`
          : phase === 'shuffling'
            ? 'Shuffling...'
            : 'Pick a cup'}
      </button>
    </div>
  );
};

export default Cups;
