import { useEffect, useState } from 'react';
import { useConvexAuth } from 'convex/react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import { useUser } from '../lib/useUser';
import { useSettings } from '../lib/settings';
import { authClient } from '../lib/auth-client';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const ToggleRow = ({ label, description, checked, onChange }: ToggleRowProps) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 py-3 text-left cursor-pointer group"
    title={`Toggle ${label}`}
  >
    <span>
      <span className="block font-mono text-sm font-bold text-primary dark:text-[#f4d5ad]">{label}</span>
      {description && (
        <span className="block text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50 mt-0.5">
          {description}
        </span>
      )}
    </span>
    <span
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-accent dark:bg-[#c98a6e]' : 'bg-primary/20 dark:bg-[#f4d5ad]/20'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
      />
    </span>
  </button>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="bg-secondary/10 dark:bg-secondary/5 border border-primary/20 dark:border-[#f4d5ad]/20 p-6 rounded-2xl">
    <h2 className="text-lg font-sans font-bold mb-2 text-primary dark:text-[#f4d5ad]">{title}</h2>
    <div className="divide-y divide-primary/10 dark:divide-[#f4d5ad]/10">{children}</div>
  </section>
);

const SettingsPage = () => {
  useEffect(() => {
    document.title = 'Settings — Jasper Sona';
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useUser();
  const { settings, setSetting } = useSettings();
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try { await authClient.signOut(); } catch { /* ignore */ }
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rarityData');
    navigate('/');
  };

  const handleResetCache = () => {
    if (!window.confirm('Clear your locally cached rarity collection? Your server data is not affected.')) return;
    localStorage.removeItem('rarityData');
    setDataMessage('Local cache cleared.');
    setTimeout(() => setDataMessage(null), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center font-mono text-primary dark:text-[#f4d5ad]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] text-primary dark:text-[#f4d5ad] transition-colors duration-300">
      <Navbar />
      <Breadcrumbs />
      <main className="max-w-2xl mx-auto p-8 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-sans font-bold">Settings</h1>
        </div>

        <Section title="Appearance">
          <ToggleRow
            label="Dark mode"
            description="Use the dark theme across the site."
            checked={settings.theme === 'dark'}
            onChange={(next) => setSetting('theme', next ? 'dark' : 'light')}
          />
          <ToggleRow
            label="Reduce motion"
            description="Shorten or skip long animations like the rolling reel."
            checked={settings.reduceMotion}
            onChange={(next) => setSetting('reduceMotion', next)}
          />
          <ToggleRow
            label="Sound effects"
            description="Play a whoosh on roll and a chime scaled to the rarity won."
            checked={settings.soundEnabled}
            onChange={(next) => setSetting('soundEnabled', next)}
          />
        </Section>

        <Section title="Display">
          <ToggleRow
            label="Compact collection grid"
            description="Render the rarity collection denser and smaller."
            checked={settings.compactGrid}
            onChange={(next) => setSetting('compactGrid', next)}
          />
          <ToggleRow
            label="Show rarity names"
            description="Show each rarity's name under its number in the grid."
            checked={settings.showRarityNames}
            onChange={(next) => setSetting('showRarityNames', next)}
          />
        </Section>

        <Section title="Account">
          <div className="py-3 flex items-center justify-between gap-4">
            <span>
              <span className="block font-mono text-sm font-bold">{user.email}</span>
              <span className="block text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50 mt-0.5">
                Signed in as {user.username || user.name || 'Player'}
              </span>
            </span>
            <Link
              to="/profile"
              className="px-4 py-2 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              title="Edit your profile"
            >
              Edit Profile
            </Link>
          </div>
          <div className="py-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-mono text-sm font-bold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              title="Log out of your account"
            >
              Log Out
            </button>
          </div>
        </Section>

        <Section title="Data">
          <div className="py-3 flex items-center justify-between gap-4">
            <span>
              <span className="block font-mono text-sm font-bold">Local cache</span>
              <span className="block text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50 mt-0.5">
                Clears the rarity collection stored in this browser.
              </span>
            </span>
            <button
              onClick={handleResetCache}
              className="px-4 py-2 bg-primary/10 dark:bg-[#f4d5ad]/10 border border-primary/20 dark:border-[#f4d5ad]/20 font-mono text-sm rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
              title="Clear locally cached rarity data"
            >
              Clear Cache
            </button>
          </div>
          {dataMessage && <p className="text-xs font-mono text-green-600 dark:text-green-400 py-1">{dataMessage}</p>}
        </Section>
      </main>
    </div>
  );
};

export default SettingsPage;