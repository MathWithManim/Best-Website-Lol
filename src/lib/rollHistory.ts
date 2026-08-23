const KEY = 'rollHistory:v1';
const CAP = 50;

export interface RollHistoryEntry {
  rarity: string;
  index: number;
  at: number;
  unlocked?: number;
}

export function getRollHistory(): RollHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e.rarity === 'string') : [];
  } catch {
    return [];
  }
}

export function recordRoll(entry: Omit<RollHistoryEntry, 'at'>) {
  try {
    const list = getRollHistory();
    list.unshift({ ...entry, at: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, CAP)));
  } catch {
    /* ignore quota errors */
  }
}
