const SECRET = "js_rng_v1_xK9mP";

function hashCode(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash).toString(36);
}

export function encodeRarityData(data: Record<string, number>): string {
  const json = JSON.stringify(data);
  const sig = hashCode(json + SECRET);
  return btoa(JSON.stringify({ d: data, s: sig }));
}

export function decodeRarityData(encoded: string): Record<string, number> | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (hashCode(JSON.stringify(parsed.d) + SECRET) !== parsed.s) return null;
    return parsed.d as Record<string, number>;
  } catch {
    return null;
  }
}
