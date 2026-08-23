import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface Settings {
  /** Light or dark theme. Applied to <html class="dark">. */
  theme: ThemeMode;
  /** When true, long/looping animations are shortened or skipped entirely. */
  reduceMotion: boolean;
  /** When true, rarity grid cells render smaller and denser. */
  compactGrid: boolean;
  /** When true, rarity names are shown under the number in the grid. */
  showRarityNames: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  reduceMotion: false,
  compactGrid: false,
  showRarityNames: true,
  soundEnabled: true,
};

export const SETTINGS_STORAGE_KEY = 'settings:v1';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    /* ignore corrupt storage */
  }
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return { ...DEFAULT_SETTINGS, theme: prefersDark ? 'dark' : 'light' };
}

export interface SettingsContextValue {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}