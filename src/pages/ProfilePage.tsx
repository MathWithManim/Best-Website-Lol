import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { RARITY_COLORS } from '../components/RarityStatsModal';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedToken = localStorage.getItem('sessionToken');
    if (!storedEmail || !storedToken) {
      navigate('/rng');
    } else {
      setEmail(storedEmail);
      setSessionToken(storedToken);
    }
  }, [navigate]);

  const user = useQuery(api.users.getUser, email && sessionToken ? { email, sessionToken } : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const logoutMutation = useMutation(api.users.logout);

  const searchResults = useQuery(
    api.users.searchUsers,
    activeSearch && sessionToken ? { query: activeSearch, sessionToken } : "skip"
  );

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [pfp, setPfp] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setPfp(user.pfp || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    setError(null);
    try {
      await updateProfile({ sessionToken, name, username, bio, pfp });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try { await logoutMutation({ sessionToken }); } catch { /* ignore */ }
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('rarityData');
    navigate('/rng');
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setActiveSearch(searchInput.trim());
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center font-mono text-primary dark:text-[#f4d5ad]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] text-primary dark:text-[#f4d5ad] transition-colors duration-300">
      <Navbar />
      <main className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-sans font-bold">User Profile</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-mono rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-secondary/10 dark:bg-secondary/5 border border-primary/20 dark:border-[#f4d5ad]/20 p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={pfp || "https://api.dicebear.com/7.x/bottts/svg?seed=default"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-accent bg-bg dark:bg-[#2d1e14] object-cover"
            />
            <div className="flex-1 w-full">
              <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Profile Picture URL</label>
              <input
                type="text"
                value={pfp}
                onChange={(e) => setPfp(e.target.value)}
                className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Changes
            </button>
            {saved && <span className="text-green-600 dark:text-green-400 font-mono text-sm">Saved successfully!</span>}
            {error && <span className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</span>}
          </div>
        </form>

        {/* Search Users */}
        <div className="mt-12">
          <h2 className="text-2xl font-sans font-bold mb-4">Search Users</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              className="flex-1 p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Loading state while search is in flight */}
          {activeSearch && searchResults === undefined && (
            <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">Searching...</p>
          )}

          {/* Results */}
          {activeSearch && searchResults !== undefined && searchResults.length === 0 && (
            <p className="text-center text-sm font-mono text-primary/50 dark:text-[#f4d5ad]/50">No users found.</p>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result) => {
                const color = RARITY_COLORS[result.bestRarity] || '#9CA3AF';
                return (
                  <div
                    key={result.username}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-[#f4d5ad]/5 border border-primary/10 dark:border-[#f4d5ad]/10"
                  >
                    <img
                      src={result.pfp}
                      alt=""
                      className="w-10 h-10 rounded-full bg-bg dark:bg-[#2d1e14]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-bold text-primary dark:text-[#f4d5ad]">{result.username}</div>
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
      </main>
    </div>
  );
};

export default ProfilePage;
