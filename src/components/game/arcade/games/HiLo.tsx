import { db } from "../../../../db";
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';


interface Card {
  rank: number; // 2..14
  suit: string;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABEL: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const label = (r: number) => RANK_LABEL[r] ?? String(r);

const CardView = ({ card }: { card: Card }) => (
  <div className="flex h-36 w-24 flex-col justify-between rounded-xl border-2 border-primary/20 bg-[#F5E6CA] p-2.5 shadow-lg sm:h-44 sm:w-32 sm:p-3 dark:border-[#f4d5ad]/25">
    <span className={`self-start font-mono text-xl font-bold sm:text-2xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-[#1a120b]'}`}>
      {label(card.rank)}
      {card.suit}
    </span>
    <span className={`self-center text-4xl sm:text-5xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-[#1a120b]'}`}>
      {card.suit}
    </span>
    <span
      className={`self-end rotate-180 font-mono text-xl font-bold sm:text-2xl ${
        card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-[#1a120b]'
      }`}
    >
      {label(card.rank)}
      {card.suit}
    </span>
  </div>
);

const HiddenCard = () => (
  <div className="flex h-36 w-24 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-secondary/20 font-mono text-3xl text-primary/30 sm:h-44 sm:w-32 dark:border-[#f4d5ad]/30 dark:bg-[#f4d5ad]/5 dark:text-[#f4d5ad]/30">
    ?
  </div>
);

// Odds-based single guess: fair odds (13 / ways) scaled to 96% payout.
function multFor(card: number, dir: 'higher' | 'lower'): number {
  const ways = dir === 'higher' ? 14 - card : card - 2;
  return Math.floor(((ARCADE.hilo.payoutPct * 13) / ways) * 100) / 100;
}

const HiLo = () => {
  const start = useMutation(api.arcade.startHiLo);
  const guess = useMutation(api.arcade.guessHiLo);
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const beginRound = () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    start({})
      .then((res) => {
        setCard({ rank: res.card, suit: SUITS[res.card % 4] });
        setMessage('Higher or lower? One call.');
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not start'))
      .finally(() => setBusy(false));
  };

  const callDirection = (dir: 'higher' | 'lower') => {
    if (busy || !card) return;
    setBusy(true);
    guess({ direction: dir })
      .then((res) => {
        setCard({ rank: res.nextCard, suit: SUITS[res.nextCard % 4] });
        if (res.outcome === 'win') setMessage(`Called it — x${(res.payout / ARCADE.hilo.cost).toFixed(2)}! +${res.net} LB`);
        else if (res.outcome === 'push') setMessage(`Tie — stake pushed back.`);
        else setMessage(`Wrong. ${ARCADE.hilo.cost} LB gone.`);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Guess failed'))
      .finally(() => setBusy(false));
  };

  const roundOver = message !== null && (message.startsWith('Called') || message.startsWith('Wrong') || message.startsWith('Tie'));

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        <m.div
          key={card ? `${card.rank}${card.suit}` : 'none'}
          initial={{ opacity: 0, y: 10, rotateY: 90 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {card ? <CardView card={card} /> : <HiddenCard />}
        </m.div>
      </AnimatePresence>

      {card && !roundOver ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => callDirection('higher')}
            disabled={busy}
            className="cursor-pointer rounded-xl bg-green-700 px-5 py-3 font-mono text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 sm:px-7"
          >
            ▲ Higher · x{multFor(card.rank, 'higher')}
          </button>
          <button
            type="button"
            onClick={() => callDirection('lower')}
            disabled={busy}
            className="cursor-pointer rounded-xl bg-red-700 px-5 py-3 font-mono text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 sm:px-7"
          >
            ▼ Lower · x{multFor(card.rank, 'lower')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={beginRound}
          disabled={busy}
          className="cursor-pointer rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
        >
          {busy ? 'Dealing...' : `Deal (${ARCADE.hilo.cost} LB)`}
        </button>
      )}

      <p className="h-5 font-mono text-sm" role="status" aria-live="polite">
        {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
        {!error && !message && (
          <span className="text-primary/50 dark:text-[#f4d5ad]/50">One card, one call — odds set the payout.</span>
        )}
        {!error && message}
      </p>
    </div>
  );
};

export default HiLo;
