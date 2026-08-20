import { useState, useCallback, useEffect } from 'react';
import AuthModal from './AuthModal';
import RNGGame from './RNGGame';
import Shop from './Shop';
import Leaderboard from './Leaderboard';
import RarityGrid from './RarityGrid';
import RarityStatsModal from './RarityStatsModal';
import EndgameScreen from './EndgameScreen';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { encodeRarityData, decodeRarityData } from '../lib/crypto';
import { useUser } from '../lib/useUser';

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
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setRollCounter] = useState(0);
  const [rebirthError, setRebirthError] = useState<string | null>(null);
  const rebirth = useMutation(api.rng.rebirth);

  useEffect(() => {
    if (window.location.hash === '#rng') {
      document.getElementById('rng')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const user = useUser();
  const userRarityCounts = useQuery(api.rng.getUserRarityCounts, isAuthenticated ? {} : "skip");
  const rarityStats = useQuery(api.rng.getRarityStats);
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

  const handleRollComplete = useCallback(() => {
    setRollCounter(c => c + 1);
  }, []);

  const handleSellComplete = useCallback(() => {
    setRollCounter(c => c + 1);
  }, []);

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
          {user?.completedGame ? (
            <EndgameScreen distinctCaught={user.distinctCaught} />
          ) : (
            <>
              <RNGGame 
                onRollComplete={handleRollComplete} 
                rollCost={user?.nextRollCost ?? 0}
                luckBucks={luckBucks ?? 0}
                totalRarities={user?.totalRarities ?? 50}
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
          <Shop />
          <Leaderboard />
        </div>
        <div className="w-full md:w-3/5">
          <h2 className="text-xl md:text-2xl font-sans font-bold mb-6 text-white text-center drop-shadow-lg">
            Rarity Collection
          </h2>
          <div className="bg-black/20 dark:bg-black/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <RarityGrid
              rarityCounts={displayCounts}
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
    </div>
  );
};

export default RNGSection;