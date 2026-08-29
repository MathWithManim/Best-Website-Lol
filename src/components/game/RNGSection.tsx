import { useState, useCallback, useEffect } from 'react';
import AuthModal from '../app/AuthModal';
import RNGGame from './RNGGame';
import Shop from '../Shop';
import Leaderboard from './Leaderboard';
import RarityGrid from './RarityGrid';
import RarityStatsModal from './RarityStatsModal';
import EndgameScreen from '../EndgameScreen';
import RecentWins from '../RecentWins';
import { fmtCompact } from '../../lib/format';
import { RARITIES, RARITY_VALUES } from '../../lib/rarities';
import RollHistory from '../RollHistory';
import LuckPanel from '../LuckPanel';
import CompletionRing from '../CompletionRing';
import AccountSettingsModal from './AccountSettingsModal';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';

import { encodeRarityData, decodeRarityData } from '../../lib/crypto';
import { useUser } from '../../lib/useUser';
import { api } from "../../convex/_generated/api";
import { authClient } from '../../lib/auth-client';

const getCachedCounts = (): Record<string, number> => {
  try {
    const encoded = localStorage.getItem('rarityData');
    if (encoded) {
      return decodeRarityData(encoded) || {};
    }
  } catch { /* ignore */ }
  return {};
};

const RNGSection = () => {
  let convexAuth: any = { isAuthenticated: false, isLoading: false };
  try { convexAuth = useConvexAuth(); } catch { convexAuth = { isAuthenticated: false, isLoading: false }; }
  // Better-Auth (Neon) session — must be called unconditionally as a hook
  let baSession: any = undefined;
  try { baSession = (authClient as any).useSession?.(); } catch { baSession = undefined; }

  // Unified auth: authenticated if EITHER Convex or Neon has a session
  let isAuthenticated = false;
  let authLoading = false;
  if (baSession !== undefined) {
    if (baSession?.data?.user) {
      isAuthenticated = true;
      authLoading = false;
    } else if (baSession?.isPending) {
      isAuthenticated = false;
      authLoading = true;
    } else {
      isAuthenticated = convexAuth.isAuthenticated;
      authLoading = convexAuth.isLoading;
    }
  } else {
    isAuthenticated = convexAuth.isAuthenticated;
    authLoading = convexAuth.isLoading;
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rebirthError, setRebirthError] = useState<string | null>(null);
  const rebirth = useMutation(api.rng.rebirth);

  useEffect(() => {
    if (window.location.hash === '#rng') {
      document.getElementById('rng')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const user = useUser();
  const userRarityCounts = useQuery(api.rng.getUserRarityCounts, isAuthenticated ? {} : "skip");
  const rarityStats = useQuery(api.rng.getRarityStats, isAuthenticated ? {} : "skip");
  const luckBucks = useQuery(api.shop.getLuckBucks, isAuthenticated ? {} : "skip");

  const isLoading = authLoading || userRarityCounts === undefined || (isAuthenticated && luckBucks === undefined);

  const displayCounts = userRarityCounts || getCachedCounts();

  useEffect(() => {
    if (userRarityCounts && user?.email) {
      try {
        localStorage.setItem('rarityData', encodeRarityData(userRarityCounts));
      } catch { /* ignore */ }
    }
  }, [userRarityCounts, user?.email]);

  const handleRarityClick = (rarity: string, index: number) => {
    setSelectedRarity(rarity);
    setSelectedIndex(index);
    setModalOpen(true);
  };

  // Convex queries are reactive, so the grid and reel refresh on their own.
  const handleRollComplete = useCallback(() => {}, []);
  const handleSellComplete = useCallback(() => {}, []);
  const sellBulkJunk = useMutation(api.rng.sellBulkJunk);
  const prestigeMut = useMutation(api.rng.prestige);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [prestigeBusy, setPrestigeBusy] = useState(false);

  const totalRolls = useQuery(api.leaderboard.getTotalRolls);

  const junkPreview = (maxValue: number) =>
    Object.entries(displayCounts).reduce((sum, [rarity, count]) => {
      const c = count as number;
      const idx = RARITIES.indexOf(rarity);
      if (idx < 0) return sum;
      const value = RARITY_VALUES[idx];
      return value > 0 && value <= maxValue ? sum + value * c : sum;
    }, 0);

  const handlePrestige = useCallback(async () => {
    if (prestigeBusy) return;
    if (!window.confirm("Prestige resets your collection and rebirths, but grants a permanent +25% sell bonus. Continue?")) return;
    setPrestigeBusy(true);
    try {
      await prestigeMut();
      setBulkMsg(`★ Prestige ${user?.prestigeCount ?? 0} — the hunt begins again`);
    } catch (err: unknown) {
      setBulkMsg(err instanceof Error ? err.message : 'Prestige failed');
    } finally {
      setPrestigeBusy(false);
    }
  }, [prestigeBusy, prestigeMut, user?.prestigeCount]);

  useEffect(() => {
    document.title = 'RNG Game — Jasper Sona';
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  useEffect(() => {
    if (!bulkMsg) return;
    const t = setTimeout(() => setBulkMsg(null), 4000);
    return () => clearTimeout(t);
  }, [bulkMsg]);

  const handleSellJunk = useCallback(async (maxSellValue: number, label: string) => {
    if (bulkBusy) return;
    setBulkBusy(true);
    setBulkMsg(null);
    try {
      const res = await sellBulkJunk({ maxSellValue });
      setBulkMsg(`Sold ${res.soldItems} items for ${res.earned.toLocaleString()} LB`);
    } catch (err: unknown) {
      setBulkMsg(err instanceof Error ? err.message : `${label} failed`);
    } finally {
      setBulkBusy(false);
    }
  }, [bulkBusy, sellBulkJunk]);

  const handleRebirth = useCallback(async () => {
    setRebirthError(null);
    try {
      await rebirth();
    } catch (err: unknown) {
      setRebirthError(err instanceof Error ? err.message : 'Rebirth failed');
    }
  }, [rebirth]);

  if (!isAuthenticated || authLoading) {
    return <AuthModal />;
  }

  const statsForSelected = rarityStats?.find(s => s.rarity === selectedRarity) || null;
  const userCountForSelected = displayCounts[selectedRarity] || 0;

  const rebirthEligible = !!user && !user.completedGame && user.rebirthCount < 45 && user.distinctCaught >= user.nextRebirthAt;

  return (
    <div id="rng" className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* top bar: back to site + settings gear (only when logged in) */}
      <div className="flex items-center justify-between mb-6">
        <a href="/" className="inline-flex items-center gap-2 font-mono text-xs font-bold text-white/60 hover:text-white transition-colors">
          <span aria-hidden>←</span> Jasper Sona
        </a>
        <button
          onClick={()=>setSettingsOpen(true)}
          aria-label="Open account settings"
          title="Account settings — edit bio, name, avatar"
          className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 15a1.65 1.65 0 0 0-1-1.51V13a1.65 1.65 0 0 0 1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 13.5 7a1.65 1.65 0 0 0 1 1.51V9a1.65 1.65 0 0 0-1 1.51 1.65 1.65 0 0 0 .33 1.82Z"/></svg>
        </button>
      </div>
      <RecentWins />
      <div className="relative flex flex-col md:flex-row gap-8 md:gap-12 items-start bg-black/20 dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="w-full md:w-2/5 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-sans font-bold mb-6 text-white text-center drop-shadow-lg">
            RNG Game
          </h1>
          <div className="mb-4 px-4 py-2 rounded-lg bg-accent/10 dark:bg-[#c98a6e]/10 border border-accent/20 dark:border-[#c98a6e]/20">
            <span className="font-mono text-sm text-primary dark:text-[#f4d5ad]">
              💰 {luckBucks !== undefined ? luckBucks.toLocaleString() : '...'} LuckBucks
            </span>
          </div>
          {!!user?.prestigeCount && (
            <div className="mb-2 px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 font-mono text-xs text-purple-300">
              ★ Prestige {user.prestigeCount} · sells ×{(1 + 0.25 * user.prestigeCount).toFixed(2)}
            </div>
          )}
          <p className="mb-3 font-mono text-[10px] text-white/40">
            🌍 {totalRolls !== undefined ? fmtCompact(totalRolls) : '…'} rolls served worldwide
          </p>
          {user?.completedGame ? (
            <>
              <EndgameScreen distinctCaught={user.distinctCaught} />
              <button
                onClick={handlePrestige}
                disabled={prestigeBusy}
                title="Reset your collection and rebirths for a permanent +25% sell bonus"
                aria-busy={prestigeBusy}
                className="mt-4 w-full py-3 px-8 bg-purple-600 text-white font-mono text-base font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg cursor-pointer active:scale-95"
              >
                {prestigeBusy ? 'Ascending…' : `★ Prestige — +25% sells forever`}
              </button>
            </>
          ) : (
            <>
              <RNGGame 
                onRollComplete={handleRollComplete} 
                rollCost={user?.nextRollCost ?? 0}
                luckBucks={luckBucks ?? 0}
                totalRarities={user?.totalRarities ?? 50}
                discovered={user?.discovered ?? {}}
              />
              {user && user.rebirthCount < 45 && (
                <div className="mt-4 w-full flex flex-col items-center gap-2">
                  <div className="w-full text-center font-mono text-xs text-white/70">
                    Rarity {user.distinctCaught}/{user.totalRarities} · Rebirth {user.rebirthCount}/45
                  </div>
                  <button
                    onClick={handleRebirth}
                    disabled={!rebirthEligible}
                    title={rebirthEligible ? 'Reset progress and unlock 10 more rarities' : `Catch ${user.nextRebirthAt} distinct rarities to rebirth`}
                    className="w-full py-3 px-8 bg-purple-600 text-white font-mono text-base font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer active:scale-95"
                  >
                    {rebirthEligible ? `Rebirth — Unlock 10 More (${user.nextRebirthAt} caught)` : `Rebirth at ${user.nextRebirthAt} caught`}
                  </button>
                  {rebirthError && (
                    <div className="w-full p-2 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 font-mono text-xs rounded-lg text-center">
                      {rebirthError}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
                    <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
            <button
              onClick={() => handleSellJunk(10, 'Sell Commons')}
              disabled={bulkBusy}
              title={`Sell every owned rarity worth 10 LB or less\n≈ ${junkPreview(10).toLocaleString()} LB waiting`}
              className="px-3 py-1.5 bg-red-600/80 text-white font-mono text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              ⚡ Sell Commons (≤10 LB)
            </button>
            <button
              onClick={() => handleSellJunk(50, 'Sell Low-Tier')}
              disabled={bulkBusy}
              title={`Sell every owned rarity worth 50 LB or less\n≈ ${junkPreview(50).toLocaleString()} LB waiting`}
              className="px-3 py-1.5 bg-orange-600/80 text-white font-mono text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              ⚡ Sell Low-Tier (≤50 LB)
            </button>
          </div>
          {bulkMsg && (
            <p role="status" className="text-center text-xs font-mono text-emerald-400 mb-3 w-full">
              {bulkMsg}
            </p>
          )}
          <Shop />
          <Leaderboard />
          <RollHistory />
          <LuckPanel />
        </div>
        <div className="w-full md:w-3/5">
          <h2 className="text-xl md:text-2xl font-sans font-bold mb-4 text-white text-center drop-shadow-lg">
            Rarity Collection
          </h2>
          <CompletionRing distinctCaught={user?.distinctCaught ?? 0} totalRarities={user?.totalRarities ?? 50} />          <div className="bg-black/20 dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <RarityGrid
              rarityCounts={displayCounts}
              discovered={user?.discovered ?? {}}
              onRarityClick={handleRarityClick}
              isLoading={isLoading}
              totalRarities={user?.totalRarities ?? 50}
            />
          </div>
        </div>
      </div>
      <RarityStatsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rarity={selectedRarity}
        index={selectedIndex}
        stats={statsForSelected ? { count: statsForSelected.count, uniqueUsers: statsForSelected.uniqueUsers, chance: statsForSelected.chance } : null}
        userCount={userCountForSelected}
        onSellComplete={handleSellComplete}
      />
      <AccountSettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)} />
    </div>
  );
};

export default RNGSection;
