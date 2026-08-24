import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getGame } from '../lib/games';
import { useUser } from '../lib/useUser';
import Plinko from '../components/arcade/games/Plinko';
import CoinFlip from '../components/arcade/games/CoinFlip';
import HiLo from '../components/arcade/games/HiLo';
import WheelSpin from '../components/arcade/games/WheelSpin';

const GAME_COMPONENTS: Record<number, ComponentType> = {
  1: Plinko,
  2: CoinFlip,
  3: HiLo,
  4: WheelSpin,
};

const ArcadePage = () => {
  const { gameId } = useParams();
  const game = getGame(gameId);
  const user = useUser();
  // Auth can hang when the session endpoint is unreachable — fall back to the
  // logged-out view; the server still rejects any wager from anonymous callers.
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setAuthTimedOut(true), 4000);
    return () => window.clearTimeout(t);
  }, []);
  if (!game) return <Navigate to="/" replace />;

  const Game = GAME_COMPONENTS[game.id];
  const loading = user === undefined && !authTimedOut;
  const loggedIn = user !== null && user !== undefined;

  return (
    <main className="min-h-screen px-4 pb-16 pt-[104px]">
      <div className="mx-auto max-w-xl">
        <Link
          to="/rng"
          className="font-mono text-xs text-primary/50 dark:text-[#f4d5ad]/50 hover:text-accent dark:hover:text-[#c98a6e] transition-colors"
        >
          ← Back to the game
        </Link>

        <header className="mt-4 mb-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: game.color }}>
            Mini arcade · game {game.id}
          </p>
          <h1 className="mt-1 font-cursive text-5xl font-bold text-primary dark:text-[#f4d5ad]">{game.name}</h1>
          <p className="mt-2 font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60">{game.tagline}</p>
        </header>

        <div className="rounded-3xl border border-primary/15 dark:border-[#f4d5ad]/15 bg-secondary/20 dark:bg-secondary/10 p-4 sm:p-6 md:p-10">
          {loading ? (
            <p className="py-10 text-center font-mono text-sm text-primary/50 dark:text-[#f4d5ad]/50">Loading...</p>
          ) : !loggedIn ? (
            <div className="py-8 text-center">
              <p className="font-mono text-sm font-bold text-primary dark:text-[#f4d5ad]">
                Wagering needs an account
              </p>
              <p className="mx-auto mt-2 max-w-xs font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60">
                Sign up or log in from the main game page, then come back — your LuckBucks carry over.
              </p>
              <Link
                to="/rng"
                className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 font-mono text-sm font-bold text-bg hover:opacity-90 active:scale-95 dark:bg-accent dark:text-[#1a120b]"
              >
                Go to /rng
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60">
                Balance:{' '}
                <span className="font-bold text-accent dark:text-[#c98a6e]">
                  {(user.luckbucks || 0).toLocaleString()} LB
                </span>
              </p>
              <Game />
            </>
          )}
        </div>

        <aside aria-label="Rules" className="mt-6 rounded-2xl border border-primary/15 dark:border-[#f4d5ad]/15 p-4 sm:p-5">
          <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-wide text-accent dark:text-[#c98a6e]">
            Rules · cost {game.cost} LB
          </h2>
          <ul className="space-y-1.5">
            {game.rules.map((r) => (
              <li
                key={r}
                className="relative pl-3 font-mono text-xs leading-relaxed text-primary/70 before:absolute before:left-0 before:content-['▸'] before:text-accent dark:text-[#f4d5ad]/70 dark:before:text-[#c98a6e]"
              >
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10px] text-primary/40 dark:text-[#f4d5ad]/40">
            The server rolls every outcome at the moment you press the button. No scripts, no trust issues.
          </p>
        </aside>
      </div>
    </main>
  );
};

export default ArcadePage;
