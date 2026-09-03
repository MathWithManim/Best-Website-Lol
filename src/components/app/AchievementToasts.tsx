import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useUser } from '../../lib/useUser';
import { useSettings } from '../../lib/settings';

interface ToastItem {
  key: string;
  name: string;
  description: string;
}

const TOAST_LIFETIME_MS = 4200;

// Celebrates achievements the moment their `unlocked` flag flips between
// renders. The first snapshot after load never fires, so already-earned
// achievements don't spam toasts on every page visit.
const AchievementToasts = () => {
  const user = useUser();
  const { settings } = useSettings();
  const prevUnlockedRef = useRef<Set<string> | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!user || !Array.isArray(user.achievements)) return;
    const unlockedNow = new Set(user.achievements.filter((a) => a.unlocked).map((a) => a.id));
    const prev = prevUnlockedRef.current;
    prevUnlockedRef.current = unlockedNow;
    if (!prev) return;
    let changed = unlockedNow.size !== prev.size;
    if (!changed) {
      for (const id of unlockedNow) {
        if (!prev.has(id)) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) return;

    const items = (Array.isArray(user?.achievements) ? user.achievements : [])
      .filter((a) => a.unlocked && !prev.has(a.id))
      .slice(0, 3)
      .map((a) => ({ key: `${a.id}:${Date.now()}`, name: a.name, description: a.description }));
    setToasts((cur) => [...cur, ...items].slice(-3));
    items.forEach((item) => {
      window.setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.key !== item.key));
      }, TOAST_LIFETIME_MS);
    });
  }, [user]);

  if (!settings.achievementToasts) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <m.div
            key={t.key}
            role="status"
            className="w-64 p-3 rounded-xl bg-white/95 dark:bg-[#2d1e14]/95 border border-primary/20 dark:border-[#f4d5ad]/20 shadow-xl"
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <p className="text-xs font-mono font-bold text-primary dark:text-[#f4d5ad]">🏆 Achievement unlocked</p>
            <p className="text-sm font-bold font-typewriter text-primary dark:text-[#f4d5ad] mt-0.5">{t.name}</p>
            <p className="text-xs font-mono text-primary/60 dark:text-[#f4d5ad]/60 mt-0.5">{t.description}</p>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToasts;
