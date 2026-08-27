import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import RarityGrid from '../components/RarityGrid';
import { COSMETIC_ICONS } from '../lib/cosmetics';

const PublicProfilePage = () => {
  const { username = '' } = useParams();

  useEffect(() => {
    document.title = `${username} — Jasper Sona`;
    return () => { document.title = 'Jasper Sona'; };
  }, [username]);

  const profile: any = null; // Drizzle stub

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center font-mono text-primary dark:text-[#f4d5ad]">
        Loading profile…
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-bg dark:bg-[#1a120b] text-primary dark:text-[#f4d5ad]">
        <Navbar />
        <Breadcrumbs />
        <main className="max-w-2xl mx-auto p-8 text-center space-y-4">
          <h1 className="text-3xl font-sans font-bold">Player not found</h1>
          <p className="font-mono text-sm opacity-60">No player goes by “{username}”.</p>
          <Link to="/rng" className="inline-block px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
            Back to the game
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] text-primary dark:text-[#f4d5ad] transition-colors duration-300">
      <Navbar />
      <Breadcrumbs />
      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center gap-5 mb-8">
          <img
            src={profile.pfp}
            alt={`${profile.username}'s avatar`}
            className="w-20 h-20 rounded-full border-2 border-accent bg-bg dark:bg-[#2d1e14] object-cover"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-sans font-bold flex items-center gap-2">
              {profile.username}
              {profile.equippedCosmetic && (
                <span aria-hidden title={`Equipped cosmetic: ${profile.equippedCosmetic}`}>
                  {COSMETIC_ICONS[profile.equippedCosmetic] ?? '✨'}
                </span>
              )}
            </h1>
            <p className="font-mono text-sm opacity-60 line-clamp-2">{profile.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            ['Collection', `${profile.distinctCaught}/${profile.totalRarities}`],
            ['Total rolls', profile.rollCount.toLocaleString()],
            ['Rebirths', String(profile.rebirthCount)],
          ].map(([label, value]) => (
            <div key={label} className="bg-secondary/10 dark:bg-secondary/5 border border-primary/20 dark:border-[#f4d5ad]/20 p-4 rounded-xl text-center">
              <div className="font-mono text-lg font-bold">{value}</div>
              <div className="font-mono text-xs opacity-50">{label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-sans font-bold mb-4">Collection</h2>
        <RarityGrid
          rarityCounts={profile.rarityCounts}
          onRarityClick={() => {}}
          isLoading={false}
          totalRarities={profile.totalRarities}
        />
      </main>
    </div>
  );
};

export default PublicProfilePage;
