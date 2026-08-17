import { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import AuthModal from '../components/AuthModal';
import RNGGame from '../components/RNGGame';
import RarityGrid from '../components/RarityGrid';
import RarityStatsModal from '../components/RarityStatsModal';
import Shop from '../components/Shop';
import CosmeticShop from '../components/CosmeticShop';
import Leaderboard from '../components/Leaderboard';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { encodeRarityData, decodeRarityData } from '../lib/crypto';

const RNGPage = () => {
  useEffect(() => {
    document.title = 'RNG Game — Jasper Sona';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Roll for random rarities, collect items, earn LuckBucks, and compete on the leaderboard.');
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setRollCounter] = useState(0);

  const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || undefined : undefined;
  const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('sessionToken') || undefined : undefined;
  const userRarityCounts = useQuery(api.rng.getUserRarityCounts, sessionToken && isLoggedIn ? { sessionToken } : "skip");
  const rarityStats = useQuery(api.rng.getRarityStats);
  const user = useQuery(api.users.getUser, email && sessionToken ? { email, sessionToken } : "skip");
  const luckBucks = useQuery(api.shop.getLuckBucks, sessionToken ? { sessionToken } : "skip");

  const isLoading = userRarityCounts === undefined || (isLoggedIn && user === undefined);

  // Get cached rarity data from localStorage for immediate display
  const getCachedCounts = (): Record<string, number> => {
    try {
      const encoded = localStorage.getItem('rarityData');
      if (encoded) {
        return decodeRarityData(encoded) || {};
      }
    } catch { /* ignore */ }
    return {};
  };

  // Use server data when available, fallback to cache
  const displayCounts = userRarityCounts || getCachedCounts();

  // Sync server data back to localStorage cache whenever it arrives
  useEffect(() => {
    if (userRarityCounts && email) {
      try {
        localStorage.setItem('rarityData', encodeRarityData(userRarityCounts));
      } catch { /* ignore */ }
    }
  }, [userRarityCounts, email]);

  const handleLogin = (userEmail: string, token: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('sessionToken', token);
    setIsLoggedIn(true);
  };

  const handleRarityClick = (rarity: string, index: number) => {
    setSelectedRarity(rarity);
    setSelectedIndex(index);
    setModalOpen(true);
  };

  const handleRollComplete = useCallback(() => {
    // Bump counter to force re-render; Convex query auto-refreshes
    setRollCounter(c => c + 1);
  }, []);

  const handleSellComplete = useCallback(() => {
    // Bump counter to force re-render; Convex query auto-refreshes
    setRollCounter(c => c + 1);
  }, []);

  if (!isLoggedIn) {
    return <AuthModal onLogin={handleLogin} />;
  }

  const statsForSelected = rarityStats?.find(s => s.rarity === selectedRarity) || null;
  const userCountForSelected = displayCounts[selectedRarity] || 0;

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] dark:text-[#f4d5ad] transition-colors duration-300">
      <Navbar />
      <Breadcrumbs />
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Loading skeleton while Convex connects */}
        {luckBucks === undefined && userRarityCounts === undefined && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-sm text-primary/50 dark:text-[#f4d5ad]/50">Loading game data...</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Left: Roll Area + Shop */}
          <div className="w-full md:w-2/5 flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary dark:text-[#f4d5ad] text-center">
              RNG Game
            </h1>

            {/* LuckBucks balance */}
            <div className="mb-4 px-4 py-2 rounded-lg bg-accent/10 dark:bg-[#c98a6e]/10 border border-accent/20 dark:border-[#c98a6e]/20">
              <span className="font-mono text-sm text-primary dark:text-[#f4d5ad]">
                💰 {luckBucks !== undefined ? luckBucks.toLocaleString() : '...'} LuckBucks
              </span>
            </div>

             <RNGGame 
               onRollComplete={handleRollComplete} 
               equippedCosmetic={user?.equippedCosmetic} 
             />

            {/* Shop below roll */}
            {email && sessionToken && (
              <>
                <Shop sessionToken={sessionToken} />
                <CosmeticShop email={email} sessionToken={sessionToken} />
              </>
            )}

            {/* Leaderboard */}
            <Leaderboard />
          </div>

          {/* Right: Rarity Grid */}
          <div className="w-full md:w-3/5">
            <h2 className="text-xl md:text-2xl font-sans font-bold mb-4 text-primary dark:text-[#f4d5ad] text-center">
              Rarity Collection
            </h2>
            <RarityGrid
              rarityCounts={displayCounts}
              onRarityClick={handleRarityClick}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <RarityStatsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rarity={selectedRarity}
        index={selectedIndex}
        stats={statsForSelected ? { count: statsForSelected.count, uniqueUsers: statsForSelected.uniqueUsers, chance: statsForSelected.chance } : null}
        userCount={userCountForSelected}
        sessionToken={sessionToken || ''}
        onSellComplete={handleSellComplete}
      />
    </div>
  );
};

export default RNGPage;
