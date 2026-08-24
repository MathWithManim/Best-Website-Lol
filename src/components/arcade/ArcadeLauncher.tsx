import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GAMES } from '../../lib/games';
import { PlinkoArt, CoinArt, SlotsArt, HiLoArt, WheelArt } from './GameArt';
import { useSettings } from '../../lib/settings';

const GAME_ART: Record<number, (props: { color: string; dark: string }) => ReactElement> = {
  1: PlinkoArt,
  2: CoinArt,
  3: SlotsArt,
  4: HiLoArt,
  5: WheelArt,
};

// Floating mini arcade cabinet launcher. The bob/chase animations are the
// cabinet's "attract mode"; reduced-motion users get a still cabinet that
// simply glows on hover.

const ArcadeButton = ({ onClick }: { onClick: () => void }) => {
  const { settings } = useSettings();
  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label="Open the mini arcade"
      title="Mini arcade"
      animate={settings.reduceMotion ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={settings.reduceMotion ? undefined : { rotate: -2, scale: 1.06 }}
      className="group fixed left-4 top-[84px] z-50 flex h-16 w-12 cursor-pointer flex-col overflow-hidden rounded-lg border-2 border-[#5D3A1A]/60 bg-gradient-to-b from-primary to-darker shadow-[0_6px_18px_rgba(93,58,26,0.45)] transition-shadow hover:shadow-[0_8px_26px_rgba(201,150,46,0.55)]"
    >
      {/* marquee */}
      <span className="flex h-3 items-center justify-center gap-1 bg-[#C9962E]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 w-1 rounded-full bg-[#F5E6CA]"
            style={
              settings.reduceMotion
                ? { opacity: 0.9 }
                : { animation: `arcade-chase 1.1s ${i * 0.18}s infinite` }
            }
          />
        ))}
      </span>
      {/* screen */}
      <span className="relative m-1 flex-1 rounded bg-[#1a120b]/85">
        <span
          className="absolute inset-x-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#C9962E]"
          style={
            settings.reduceMotion
              ? undefined
              : { animation: 'arcade-ball 1.4s ease-in-out infinite alternate' }
          }
        />
        <span className="absolute bottom-1 left-1 right-1 h-1 rounded-sm bg-[#f4d5ad]/25" />
        <span className="absolute bottom-2.5 left-2 right-2 h-1 rounded-sm bg-[#f4d5ad]/40" />
      </span>
      {/* coin slot */}
      <span className="mx-auto mb-1.5 h-1.5 w-5 rounded-full bg-[#1a120b]/70 shadow-inner" />
    </m.button>
  );
};

const GameCard = ({
  id,
  index,
  onClose,
}: {
  id: number;
  index: number;
  onClose: () => void;
}) => {
  const game = GAMES[id - 1];
  const Art = GAME_ART[id];
  return (
    <div style={{ perspective: '700px' }}>
      <m.div
        initial={{ opacity: 0, y: 28, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
      >
        <Link
          to={`/game/${id}`}
          onClick={onClose}
          className="game-card group relative block rounded-2xl p-4 text-left outline-none transition-transform duration-200 [transform-style:preserve-3d] hover:-translate-y-2 hover:[transform:rotateX(7deg)_rotateY(-5deg)] focus-visible:-translate-y-2 focus-visible:ring-4"
          style={{
            background: `linear-gradient(155deg, ${game.color}, ${game.dark})`,
          }}
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-white/0 transition-all duration-200 group-hover:ring-white/60 group-focus-visible:ring-white/70" />
          <span className="block h-24 w-full">{Art({ color: game.color, dark: game.dark })}</span>
          <span className="mt-2 block font-typewriter text-lg font-bold text-[#F5E6CA]">{game.name}</span>
          <span className="block font-mono text-[11px] text-[#F5E6CA]/75">{game.tagline}</span>

          {/* tooltip */}
          <span
            role="tooltip"
            className="pointer-events-none absolute -top-3 left-1/2 z-10 w-56 -translate-x-1/2 translate-y-2 rounded-lg bg-[#1a120b] px-3 py-2 text-center font-mono text-[11px] leading-snug text-[#F5E6CA] opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            {game.tooltip}
          </span>
        </Link>
      </m.div>
    </div>
  );
};

const ArcadeLauncher = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <ArcadeButton onClick={() => setOpen(true)} />
      <AnimatePresence>
        {open && (
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <m.div
              role="dialog"
              aria-modal="true"
              aria-label="Mini arcade"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="relative w-full max-w-3xl rounded-3xl border border-primary/15 dark:border-[#f4d5ad]/15 bg-[#F5E6CA] dark:bg-[#2d1e14] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close arcade"
                className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-primary/10 dark:bg-[#f4d5ad]/10 font-mono text-primary dark:text-[#f4d5ad] hover:bg-primary/20 dark:hover:bg-[#f4d5ad]/20 cursor-pointer"
              >
                x
              </button>

              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent dark:text-[#c98a6e]">
                Insert coin
              </p>
              <h2 className="mb-5 font-cursive text-4xl font-bold text-primary dark:text-[#f4d5ad]">
                Mini Arcade
              </h2>

              <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 md:grid-cols-3">
                {GAMES.map((g, i) => (
                  <GameCard key={g.id} id={g.id} index={i} onClose={() => setOpen(false)} />
                ))}
              </div>
              <p className="mt-4 text-center font-mono text-[10px] text-primary/40 dark:text-[#f4d5ad]/40">
                Just for fun — no LuckBucks involved.
              </p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ArcadeLauncher;
