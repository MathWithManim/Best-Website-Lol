import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  loadSettings,
  SettingsContext,
  SETTINGS_STORAGE_KEY,
  type Settings,
} from '../lib/settings';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const initial = loadSettings();
    // Apply the theme synchronously on first render so there is no light/dark flash.
    document.documentElement.classList.toggle('dark', initial.theme === 'dark');
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota/private-mode errors */
    }
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

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