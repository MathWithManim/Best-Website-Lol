import type { ComponentType } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getGame } from '../lib/games';
import Plinko from '../components/arcade/games/Plinko';
import CoinFlip from '../components/arcade/games/CoinFlip';
import MiniSlots from '../components/arcade/games/MiniSlots';
import HiLo from '../components/arcade/games/HiLo';
import WheelSpin from '../components/arcade/games/WheelSpin';

const GAME_COMPONENTS: Record<number, ComponentType> = {
  1: Plinko,
  2: CoinFlip,
  3: MiniSlots,
  4: HiLo,
  5: WheelSpin,
};

const ArcadePage = () => {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <Navigate to="/" replace />;

  const Game = GAME_COMPONENTS[game.id];

  return (
    <main className="min-h-screen px-4 pb-16 pt-[104px]">
      <div className="mx-auto max-w-xl">
        <Link
          to="/"
          className="font-mono text-xs text-primary/50 dark:text-[#f4d5ad]/50 hover:text-accent dark:hover:text-[#c98a6e] transition-colors"
        >
          ← Back to site
        </Link>

        <header className="mt-4 mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: game.color }}>
            Mini arcade · game {game.id}
          </p>
          <h1 className="mt-1 font-cursive text-5xl font-bold text-primary dark:text-[#f4d5ad]">{game.name}</h1>
          <p className="mt-2 font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60">{game.tagline}</p>
        </header>

        <div className="rounded-3xl border border-primary/15 dark:border-[#f4d5ad]/15 bg-secondary/20 dark:bg-secondary/10 p-6 md:p-10">
          <Game />
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-primary/40 dark:text-[#f4d5ad]/40">
          Just for fun — no LuckBucks involved.
        </p>
      </div>
    </main>
  );
};

export default ArcadePage;
