import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface Card {
  rank: number; // 2..14
  suit: string;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABEL: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const label = (r: number) => RANK_LABEL[r] ?? String(r);

const draw = (): Card => ({ rank: 2 + Math.floor(Math.random() * 13), suit: SUITS[Math.floor(Math.random() * 4)] });

const isRed = (c: Card) => c.suit === '♥' || c.suit === '♦';

const CardView = ({ card }: { card: Card }) => (
  <div className="flex h-44 w-32 flex-col justify-between rounded-xl border-2 border-primary/20 dark:border-[#f4d5ad]/25 bg-[#F5E6CA] p-3 shadow-lg">
    <span className={`self-start font-mono text-2xl font-bold ${isRed(card) ? 'text-red-600' : 'text-[#1a120b]'}`}>
      {label(card.rank)}
      {card.suit}
    </span>
    <span className={`self-center text-5xl ${isRed(card) ? 'text-red-600' : 'text-[#1a120b]'}`}>{card.suit}</span>
    <span
      className={`self-end rotate-180 font-mono text-2xl font-bold ${
        isRed(card) ? 'text-red-600' : 'text-[#1a120b]'
      }`}
    >
      {label(card.rank)}
      {card.suit}
    </span>
  </div>
);

const HiLo = () => {
  const [current, setCurrent] = useState<Card>(draw);
  const [busy, setBusy] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const guess = (dir: 'higher' | 'lower') => {
    if (busy) return;
    setBusy(true);
    const next = draw();
    window.setTimeout(() => {
      let won: boolean;
      if (next.rank === current.rank) {
        won = true;
        setMessage('Tie — house lets it slide.');
      } else {
        won = dir === 'higher' ? next.rank > current.rank : next.rank < current.rank;
        setMessage(won ? `${label(next.rank)}${next.suit} — called it.` : `${label(next.rank)}${next.suit} — busted.`);
      }
      setCurrent(next);
      setStreak((s) => {
        if (!won) return 0;
        const v = s + 1;
        setBest((b) => Math.max(b, v));
        return v;
      });
      setBusy(false);
    }, 450);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary/40 dark:text-[#f4d5ad]/40">
            Current
          </p>
          <CardView card={current} />
        </div>
        <span className="font-mono text-2xl text-primary/40 dark:text-[#f4d5ad]/40">→</span>
        <div className="text-center">
          <p className="mb-2 h-4 font-mono text-[10px] uppercase tracking-widest text-primary/40 dark:text-[#f4d5ad]/40">
            Next
          </p>
          <div style={{ perspective: '700px' }} className="h-44 w-32">
            <AnimatePresence mode="wait">
              {busy && (
                <m.div
                  key="flipping"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 0.45 }}
                  className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-primary/30 dark:border-[#f4d5ad]/30 bg-secondary/20 dark:bg-[#f4d5ad]/5"
                >
                  <span className="font-mono text-sm text-primary/40 dark:text-[#f4d5ad]/40">?</span>
                </m.div>
              )}
              {!busy && message && (
                <m.div key={message + current.rank} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CardView card={current} />
                </m.div>
              )}
              {!busy && !message && (
                <m.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-primary/30 dark:border-[#f4d5ad]/30 bg-secondary/20 dark:bg-[#f4d5ad]/5"
                >
                  <span className="font-mono text-3xl text-primary/30 dark:text-[#f4d5ad]/30">?</span>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => guess('higher')}
          disabled={busy}
          className="cursor-pointer rounded-xl bg-green-700 px-8 py-3 font-mono text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          ▲ Higher
        </button>
        <button
          type="button"
          onClick={() => guess('lower')}
          disabled={busy}
          className="cursor-pointer rounded-xl bg-red-700 px-8 py-3 font-mono text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          ▼ Lower
        </button>
      </div>

      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {message}
      </p>
      <p className="font-mono text-xs text-primary/50 dark:text-[#f4d5ad]/50">
        Streak {streak} · Best {best} · ties go to you · ace high
      </p>
    </div>
  );
};

export default HiLo;
