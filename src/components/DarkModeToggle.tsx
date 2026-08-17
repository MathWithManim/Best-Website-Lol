import { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="px-3 py-1.5 rounded-lg border border-primary/30 dark:border-[#f4d5ad]/30 bg-secondary/20 dark:bg-secondary/10 text-primary dark:text-[#f4d5ad] font-mono text-sm hover:scale-105 transition-all cursor-pointer"
      title="Toggle Dark / Light Mode"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default DarkModeToggle;
