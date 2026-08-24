import { useState } from 'react';
import type { ReactElement } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GAMES } from '../../lib/games';
import { PlinkoArt, CoinArt, HiLoArt, WheelArt } from './GameArt';

const ART: Record<number, (props: { color: string; dark: string }) => ReactElement> = {
  1: PlinkoArt,
  2: CoinArt,
  3: HiLoArt,
  4: WheelArt,
};

const ArcadeCard = ({ id, index }: { id: number; index: number }) => {
  const game = GAMES[id - 1];
  const Art = ART[id];
  const [hover, setHover] = useState(false);

  return (
    <div style={{ perspective: '700px' }}>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, type: 'spring', stiffness: 240, damping: 22 }}
      >
        <Link
          to={`/game/${id}`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          className="group relative block rounded-2xl p-4 outline-none transition-transform duration-200 hover:-translate-y-2 focus-visible:ring-4 focus-visible:ring-accent/50"
          style={{
            background: `linear-gradient(155deg, ${game.color}, ${game.dark})`,
            transform: hover ? 'rotateX(7deg) rotateY(-4deg)' : undefined,
            transformStyle: 'preserve-3d',
          }}
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-white/0 transition-all duration-200 group-hover:ring-white/60 group-focus-visible:ring-white/70" />
          <span className="mb-1 block h-20 w-full">{Art({ color: game.color, dark: game.dark })}</span>
          <span className="block font-typewriter text-lg font-bold text-[#F5E6CA]">{game.name}</span>
          <span className="font-mono text-[11px] text-[#F5E6CA]/80">
            {game.cost} LB · {game.tagline}
          </span>

          <AnimatePresence>
            {hover && (
              <m.span
                role="tooltip"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="pointer-events-none absolute -top-2 left-1/2 z-20 w-56 -translate-x-1/2 rounded-lg bg-[#1a120b] px-3 py-2 text-center font-mono text-[11px] leading-snug text-[#F5E6CA] shadow-xl"
              >
                {game.tooltip}
              </m.span>
            )}
          </AnimatePresence>
        </Link>
      </m.div>
    </div>
  );
};

// Side arcade strip on the /rng page: four LuckBucks minigames.
const ArcadeSection = () => {
  return (
    <section aria-label="Mini arcade" className="mx-auto w-full max-w-5xl px-6 pb-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent dark:text-[#c98a6e]">
        Insert coin
      </p>
      <h2 className="mb-5 font-cursive text-4xl font-bold text-primary dark:text-[#f4d5ad]">Side Arcade</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GAMES.map((g, i) => (
          <ArcadeCard key={g.id} id={g.id} index={i} />
        ))}
      </div>
      <p className="mt-4 font-mono text-[10px] text-primary/40 dark:text-[#f4d5ad]/40">
        Wager LuckBucks, win LuckBucks. Server decides every outcome — no scripts, no trust issues.
      </p>
    </section>
  );
};

export default ArcadeSection;
