import { useEffect } from 'react';
import { useSettings } from '../lib/settings';

const DarkModeToggle = () => {
  const { settings, setSetting } = useSettings();
  const isDark = settings.theme === 'dark';

  // One-time migration from the pre-settings localStorage key.
  useEffect(() => {
    const old = localStorage.getItem('theme');
    if (old === 'dark' || old === 'light') {
      setSetting('theme', old);
      localStorage.removeItem('theme');
    }
  }, [setSetting]);

  const toggleDarkMode = () => {
    setSetting('theme', isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="px-3 py-1.5 rounded-lg border border-primary/30 dark:border-[#f4d5ad]/30 bg-secondary/20 dark:bg-secondary/10 text-primary dark:text-[#f4d5ad] font-mono text-sm hover:scale-105 transition-colors cursor-pointer"
      title="Toggle Dark / Light Mode"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default DarkModeToggle;