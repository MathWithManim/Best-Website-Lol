import { useEffect, useRef, useState } from 'react';

const SYMBOLS = ['🍒', '🍋', '⭐', '🔔', '💎'];
const STOP_DELAYS = [900, 1300, 1750];

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const judge = (r: string[]) => {
  if (r[0] === r[1] && r[1] === r[2]) return `JACKPOT — three ${r[0]}!`;
  if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) return 'Two of a kind. Respectable.';
  return 'No match. The reels betray you.';
};

const MiniSlots = () => {
  const [reels, setReels] = useState<string[]>(['⭐', '💎', '🍒']);
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false]);
  const [result, setResult] = useState<string | null>(null);
  const timersRef = useRef<Array<number>>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  const spin = () => {
    if (spinning.some(Boolean)) return;
    setResult(null);
    setSpinning([true, true, true]);

    // Reel symbols are decided up front so every stop reveals a settled value.
    const final = [randomSymbol(), randomSymbol(), randomSymbol()];
    let shown = ['', '', ''];

    const tick = window.setInterval(() => {
      shown = shown.map((s) => (s === '' ? randomSymbol() : s));
      setReels([...shown]);
    }, 80);
    timersRef.current.push(tick);

    STOP_DELAYS.forEach((delay, i) => {
      const t = window.setTimeout(() => {
        shown[i] = final[i];
        setReels([...shown]);
        if (i === STOP_DELAYS.length - 1) {
          window.clearInterval(tick);
          setSpinning([false, false, false]);
          setResult(judge(final));
        }
      }, delay);
      timersRef.current.push(t);
    });
  };

  const anySpinning = spinning.some(Boolean);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2 rounded-2xl border-4 border-primary/40 dark:border-[#f4d5ad]/30 bg-[#1a120b]/85 p-4 shadow-inner">
        {reels.map((sym, i) => (
          <div
            key={i}
            className={`flex h-20 w-16 items-center justify-center rounded-xl bg-[#F5E6CA] text-4xl shadow-inner ${
              spinning[i] ? 'blur-[1.5px]' : ''
            }`}
            aria-hidden
          >
            {sym}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={anySpinning}
        className="cursor-pointer rounded-xl bg-primary px-10 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {anySpinning ? 'Spinning...' : 'Pull the lever'}
      </button>
      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {result}
      </p>
    </div>
  );
};

export default MiniSlots;
