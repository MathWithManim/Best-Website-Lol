import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m, animate, useMotionValue } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RARITIES, RARITY_COLORS, RARITY_INDEX } from '../lib/rarities';
import { useSettings } from '../lib/settings';

interface RNGGameProps {
  onRollComplete: () => void;
  equippedCosmetic?: string;
  rollCost: number;
  luckBucks: number;
  totalRarities: number;
  rarityCounts?: Record<string, number>;
}

// ——— Reel geometry ———
const UPPER = 3; // rows above the payline
const LOWER = 3; // rows below the payline
const VISIBLE = UPPER + 1 + LOWER; // 7 rows in the window
const SPIN_EASE: [number, number, number, number] = [0.12, 0.6, 0.05, 1]; // fast launch, long tail
const SETTLE_EASE: [number, number, number, number] = [0.2, 0.9, 0.3, 1]; // glide into the landing row
const MIN_SPIN_MS = 1200; // minimum spin before the server result is awaited
const MAX_SPIN_MS = 3000; // absolute cap for the settle phase
const PARTICLE_COUNT = 18;
const MAX_TILES = 2400; // hard cap on rendered strip tiles

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const mod = (a: number, b: number) => ((a % b) + b) % b;

interface RollOutcome {
  rarity: string;
  boostApplied: boolean;
}

const RNGGame = ({ onRollComplete, equippedCosmetic, rollCost, luckBucks, totalRarities, rarityCounts }: RNGGameProps) => {
  const roll = useMutation(api.rng.roll);
  const { settings } = useSettings();
  const reduceMotion = settings.reduceMotion;

  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boostActive, setBoostActive] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [tileH, setTileH] = useState(80);
  const [revealKey, setRevealKey] = useState(0);

  const stripRef = useRef<HTMLDivElement | null>(null);
  const stripY = useMotionValue(0);
  const activeAnims = useRef<Array<{ stop: () => void }>>([]);
  const countsBeforeRef = useRef<Record<string, number> | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  const n = clamp(totalRarities, 1, 500);
  const tileCount = Math.min(n * 4 + 12, MAX_TILES);
  const idleY = (tileH * VISIBLE - tileH) / 2; // top edge of the center row

  const tiles = useMemo(
    () => Array.from({ length: tileCount }, (_, i) => mod(i - UPPER, n)),
    [tileCount, n]
  );

  const cancelAnims = useCallback(() => {
    activeAnims.current.forEach((c) => c.stop());
    activeAnims.current = [];
  }, []);

  const startSpin = useCallback(
    (toY: number, duration: number, ease: [number, number, number, number]) => {
      const anim = animate(stripY, toY, { duration, ease });
      activeAnims.current.push(anim);
      return anim;
    },
    [stripY]
  );

  // Measure tile height (h-16 on mobile, md:h-20 on desktop) and keep it in sync.
  useEffect(() => {
    // StrictMode remounts effects in dev (setup → cleanup → setup); the cleanup
    // below must not leave mountedRef false or finish() would bail on the real run.
    mountedRef.current = true;
    const measure = () => {
      const el = stripRef.current?.querySelector('[data-tile]');
      if (el) setTileH((el as HTMLElement).clientHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('resize', measure);
      cancelAnims();
    };
  }, [cancelAnims]);

  // Park the reel at the last result (or rarity 0 on first mount). Mount only —
  // the strip stays put between rolls.
  useEffect(() => {
    const idx = result ? (RARITY_INDEX[result] ?? 0) : 0;
    stripY.jump(-mod(idx, n) * tileH);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(
    (outcome: RollOutcome) => {
      if (!mountedRef.current) return;
      const prev = countsBeforeRef.current;
      const wasNew = prev ? (prev[outcome.rarity] ?? 0) === 0 : false;
      setIsNew(wasNew);
      setBoostActive(outcome.boostApplied);
      setResult(outcome.rarity);
      setRevealKey((k) => k + 1);
      setShowResult(true);
      setRolling(false);
      onRollComplete();
    },
    [onRollComplete]
  );

  const handleRoll = useCallback(async () => {
    if (busyRef.current || rolling) return;
    busyRef.current = true;
    setRolling(true);
    setResult(null);
    setShowResult(false);
    setError(null);
    setBoostActive(false);
    setIsNew(false);
    countsBeforeRef.current = rarityCounts ?? null;

    const startIdx = result ? (RARITY_INDEX[result] ?? 0) : 0;
    const startY = -mod(startIdx, n) * tileH;
    const phaseAY = startY - 2 * n * tileH;
    const startedAt = Date.now();

    try {
      if (reduceMotion) {
        // Accessibility path: skip the long spin, snap straight to the result.
        const outcome = await roll();
        const idx = RARITY_INDEX[outcome.rarity] ?? 0;
        const k = Math.floor((startIdx + 2 * n - idx) / n) + 1;
        stripY.jump(idleY - (UPPER + idx + k * n) * tileH);
        finish(outcome);
        return;
      }

      // Phase A: launch the reel with a fast, decelerating burst of full laps.
      startSpin(phaseAY, 0.9, SPIN_EASE);

      // Fire the server roll in parallel; it must take at least MIN_SPIN_MS.
      const [outcome] = await Promise.all([roll(), delay(MIN_SPIN_MS)]);

      // Phase B: re-aim to the exact landing row (k = enough full laps to move forward).
      const idx = RARITY_INDEX[outcome.rarity] ?? 0;
      const k = Math.floor((startIdx + 2 * n - idx) / n) + 1;
      const finalY = idleY - (UPPER + idx + k * n) * tileH;
      const elapsed = Date.now() - startedAt;
      const remaining = clamp((MAX_SPIN_MS - elapsed) / 1000, 0.4, 1.8);
      // Fire the settle animation and wait the same wall-clock duration with a
      // timer instead of awaiting the controls: guarantees the sequence advances
      // exactly on schedule and lets us snap to the landing row (immune to
      // tween overshoot), regardless of framer-motion's internal promise timing.
      startSpin(finalY, remaining, SETTLE_EASE);
      await delay(remaining * 1000);
      stripY.jump(finalY);

      // Phase C: the clunk — a tiny drop that springs back onto the payline.
      stripY.jump(finalY - 6);
      const clunk = animate(stripY, finalY, { type: 'spring', stiffness: 650, damping: 26, mass: 0.9 });
      activeAnims.current.push(clunk);
      await delay(400);
      stripY.jump(finalY);

      finish(outcome);
    } catch (err) {
      // Revert the reel to its parked position on failure.
      cancelAnims();
      stripY.jump(startY);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Roll failed');
        setRolling(false);
      }
    } finally {
      busyRef.current = false;
    }
  }, [roll, n, tileH, idleY, reduceMotion, rolling, result, rarityCounts, startSpin, stripY, cancelAnims, finish]);

  const resultIndex = result ? (RARITY_INDEX[result] ?? 0) : 0;
  const resultColor = result ? (RARITY_COLORS[result] || '#8B4513') : '#8B4513';

  // Regenerate the particle burst on every reveal (18 cheap elements per render).
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.6;
    const dist = 60 + Math.random() * 70;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 3 + Math.random() * 5,
      duration: 0.7 + Math.random() * 0.6,
      delay: Math.random() * 0.15,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Reel window */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border-4 border-primary dark:border-[#f4d5ad] bg-[#0a0a0a] shadow-2xl"
        style={{ height: tileH * VISIBLE }}
      >
        {/* Payline */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none border-y-4 border-accent dark:border-[#c98a6e] bg-accent/10 shadow-[0_0_15px_rgba(160,82,45,0.5)]"
          style={{ height: tileH }}
        />

        {/* Edge vignettes */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        {/* Motion streak while spinning */}
        {rolling && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-[#f4d5ad]/10 to-transparent" />
        )}

        {/* Cat sidekick */}
        {rolling && equippedCosmetic === 'cat' && (
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.25, 1], rotate: [0, 12, -12, 0], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 0.55 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-4xl pointer-events-none"
          >
            🐱
          </m.div>
        )}

        {/* The reel strip — pure transform, zero React re-renders while it moves */}
        <m.div
          ref={stripRef}
          className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
          style={{ y: stripY }}
        >
          {tiles.map((rarityIndex, i) => {
            const color = RARITY_COLORS[RARITIES[rarityIndex]] || '#9CA3AF';
            return (
              <div
                key={i}
                data-tile
                className="flex flex-col items-center justify-center shrink-0 select-none"
                style={{ height: tileH, color }}
              >
                <span className="text-3xl md:text-4xl font-bold font-typewriter leading-none">
                  {rarityIndex + 1}
                </span>
                <span className="text-[10px] md:text-xs font-mono mt-1 opacity-70">
                  {RARITIES[rarityIndex]}
                </span>
              </div>
            );
          })}
        </m.div>

        {/* Result reveal */}
        <AnimatePresence>
          {showResult && result && (
            <m.div
              key={revealKey}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Burst glow */}
              <m.div
                className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full blur-2xl"
                style={{ backgroundColor: resultColor }}
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: [0.3, 2.4, 1], opacity: [0.9, 0.35, 0] }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              {/* Particles */}
              {particles.map((p, i) => (
                <m.span
                  key={i}
                  className="absolute rounded-full"
                  style={{ width: p.size, height: p.size, backgroundColor: resultColor }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                  transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
                />
              ))}
              {/* Screen flash for big hits */}
              {(isNew || resultIndex >= n - 5) && (
                <m.div
                  className="absolute inset-0"
                  style={{ background: resultColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              )}
              {/* The big number */}
              <m.div
                className="relative z-10 text-center"
                initial={{ scale: 0.4, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
              >
                <div
                  className="text-6xl md:text-7xl font-bold font-typewriter"
                  style={{ color: '#fff', textShadow: `0 0 28px ${resultColor}` }}
                >
                  {resultIndex + 1}
                </div>
                <div
                  className="text-lg md:text-2xl font-mono mt-1 px-4 py-1 bg-black/60 rounded-lg text-white font-bold"
                  style={{ textShadow: `0 0 10px ${resultColor}` }}
                >
                  {result}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  {isNew && (
                    <m.div
                      className="text-xs font-mono font-bold text-white bg-black/60 px-2 py-1 rounded"
                      style={{ boxShadow: `0 0 12px ${resultColor}` }}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      ✨ NEW!
                    </m.div>
                  )}
                  {boostActive && (
                    <m.div
                      className="text-xs font-mono font-bold text-green-300 bg-black/60 px-2 py-1 rounded"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      ⚡ BOOSTED!
                    </m.div>
                  )}
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div
          role="alert"
          className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 font-mono text-sm rounded-lg text-center"
        >
          {error}
        </div>
      )}

      <button
        onClick={handleRoll}
        disabled={rolling || luckBucks < rollCost}
        aria-busy={rolling}
        title={rollCost === 0 ? 'Execute a free roll' : `Execute a roll (costs ${rollCost} LuckBucks)`}
        className="w-full py-4 px-8 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-lg font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer active:scale-95"
      >
        {rolling ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Rolling...
          </span>
        ) : luckBucks < rollCost ? (
          `Need ${rollCost.toLocaleString()} LuckBucks`
        ) : rollCost === 0 ? (
          'Execute Roll (FREE)'
        ) : (
          `Execute Roll (${rollCost} LuckBucks)`
        )}
      </button>
    </div>
  );
};

export default RNGGame;