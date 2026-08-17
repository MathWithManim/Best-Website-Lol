export function encodeRarityData(data: Record<string, number>): string {
  return btoa(JSON.stringify({ d: data, t: Date.now() }));
}

export function decodeRarityData(encoded: string): Record<string, number> | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (!parsed.d || typeof parsed.d !== "object") return null;
    const age = Date.now() - (parsed.t || 0);
    if (age > 7 * 24 * 60 * 60 * 1000) return null;
    return parsed.d as Record<string, number>;
  } catch {
    return null;
  }
}
