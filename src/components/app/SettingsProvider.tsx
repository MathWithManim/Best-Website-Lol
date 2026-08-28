import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  loadSettings,
  SettingsContext,
  SETTINGS_STORAGE_KEY,
  type Settings,
} from '../../lib/settings';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Dark mode lives statically in index.html (<html class="dark">), not here.
    return loadSettings();
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota/private-mode errors */
    }
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      setSetting: (key: keyof Settings, next: Settings[keyof Settings]) =>
        setSettings((prev) => ({ ...prev, [key]: next })),
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};