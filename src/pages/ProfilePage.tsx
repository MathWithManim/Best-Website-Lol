import { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../lib/useUser';
import { authClient } from '../lib/auth-client';
import { RARITY_COLORS } from '../lib/rarities';
import { COSMETIC_ICONS } from '../lib/cosmetics';

const ProfilePage = () => {
  useEffect(() => {
    document.title = 'Profile — Jasper Sona';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Manage your profile, update your display name, username, bio, and search other users.');
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  const navigate = useNavigate();
  const user = useUser();
  let isAuthenticated = false;
  let isLoading = false;
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  ) as any;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [pfp, setPfp] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName((user as any).name || '');
      setUsername((user as any).username || '');
      setBio((user as any).bio || '');
      setPfp((user as any).pfp || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateProfile({ name, username, bio, pfp } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleLogout = async () => {
    try { await authClient.signOut(); } catch { /* ignore */ }
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rarityData');
    navigate('/');
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setActiveSearch(searchInput.trim());
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center font-mono text-primary dark:text-[#f4d5ad]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] text-primary dark:text-[#f4d5ad] transition-colors duration-300">
      <Breadcrumbs />
      <main className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-sans font-bold">User Profile</h1>
            <button
              onClick={handleLogout}
              title="Log out of your account"
              className="px-4 py-2 bg-red-600 text-white font-mono rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
            Log Out
          </button>
        </div>

        {(user as any).equippedCosmetic && (
          <div className="-mt-4 mb-8">
            <span
              title={`Equipped cosmetic: ${(user as any).equippedCosmetic}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded bg-accent/10 dark:bg-[#c98a6e]/10 border border-accent/20 dark:border-[#c98a6e]/20 text-primary dark:text-[#f4d5ad]"
            >
              <span aria-hidden>{(COSMETIC_ICONS as any)[(user as any).equippedCosmetic] ?? '✨'}</span>
              {(user as any).equippedCosmetic}
            </span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-secondary/10 dark:bg-secondary/5 border border-primary/20 dark:border-[#f4d5ad]/20 p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={pfp || "https://api.dicebear.com/7.x/bottts/svg?seed=default"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-accent bg-bg dark:bg-[#2d1e14] object-cover"
            />
            <div className="flex-1 w-full">
              <label htmlFor="profile-pfp" className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Profile Picture URL</label>
              <input
                id="profile-pfp"
                type="text"
                value={pfp}
                onChange={(e) => setPfp(e.target.value)}
                className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="profile-name" className="font-mono text-sm text-primary dark:text-[#f4d5ad]">Display Name</label>
              <span className="font-mono text-[10px] opacity-40">{name.length}/50</span>
            </div>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="profile-username" className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Username</label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="profile-bio" className="font-mono text-sm text-primary dark:text-[#f4d5ad]">Bio</label>
              <span className="font-mono text-[10px] opacity-40">{bio.length}/500</span>
            </div>
            <textarea
              id="profile-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              title="Save all profile changes"
              className="px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Changes
            </button>
            {saved && <span className="text-green-600 dark:text-green-400 font-mono text-sm">Saved successfully!</span>}
            {error && <span role="alert" className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</span>}
          </div>
        </form>

        <div className="mt-12">
          <h2 className="text-2xl font-sans font-bold mb-4">Search Users</h2>
          <div className="flex gap-2 mb-4">
            <label htmlFor="user-search" className="sr-only">Search users by username</label>
            <input
              id="user-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              className="flex-1 p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSearch}
              title="Search for a user by username"
              className="px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Search
            </button>
          </div>

          {activeSearch && searchResults === undefined && (
            <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">Searching...</p>
          )}

          {activeSearch && searchResults !== undefined && (searchResults as any[]).length === 0 && (
            <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">No users found.</p>
          )}

          {searchResults && (searchResults as any[]).length > 0 && (
            <div className="space-y-2">
              {(searchResults as any[]).map((result: any) => {
                const color = (RARITY_COLORS as any)[result.bestRarity] || '#9CA3AF';
                return (
                  <div
                    key={result.username}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-[#f4d5ad]/5 border border-primary/10 dark:border-[#f4d5ad]/10"
                  >
                    <img
                      src={result.pfp}
                      alt={`${result.username}'s avatar`}
                      className="w-10 h-10 rounded-full bg-bg dark:bg-[#2d1e14]"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/u/${result.username}`}
                        className="font-mono text-sm font-bold text-primary dark:text-[#f4d5ad] hover:text-accent dark:hover:text-[#c98a6e] transition-colors truncate block"
                        title={`View ${result.username}'s public profile`}
                      >
                        {result.username}
                      </Link>
                      <div className="text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50">{result.totalRolls} rolls</div>
                    </div>
                    {result.bestRarity && (
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold" style={{ color }}>{result.bestRarity}</div>
                        <div className="text-[10px] font-mono text-primary/40 dark:text-[#f4d5ad]/40">Best roll</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>


        <div className="mt-10">
          <h2 className="text-2xl font-sans font-bold mb-4">Achievements</h2>
          {(user as any).achievements.length === 0 ? (
            <p className="text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">No achievements defined yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(user as any).achievements.map((a: any) => (
                <div
                  key={a.id}
                  title={a.unlocked ? a.description : `${a.description} (locked)`}
                  aria-label={`${a.name}: ${a.unlocked ? 'unlocked' : 'locked'}`}
                  data-testid={`achievement-${a.id}`}
                  className={`p-3 rounded-lg border font-mono text-xs text-center transition-colors ${
                    a.unlocked
                      ? 'bg-accent/15 dark:bg-[#c98a6e]/15 border-accent/40 dark:border-[#c98a6e]/40 text-primary dark:text-[#f4d5ad]'
                      : 'bg-primary/5 dark:bg-[#f4d5ad]/5 border-primary/10 dark:border-[#f4d5ad]/10 text-primary/30 dark:text-[#f4d5ad]/30'
                  }`}
                >
                  <div aria-hidden className="text-lg mb-1">{a.unlocked ? '🏆' : '🔒'}</div>
                  {a.name}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
