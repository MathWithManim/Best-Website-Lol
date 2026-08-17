const SECRET = "js_rng_v1_xK9mP_9f3aL2qB7wE5nR8tY4uI0oP";

function hashCode(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash).toString(36);
}

export function encodeRarityData(data: Record<string, number>): string {
  const json = JSON.stringify(data);
  const ts = Date.now();
  const sig = hashCode(json + ts + SECRET);
  return btoa(JSON.stringify({ d: data, s: sig, t: ts }));
}

export function decodeRarityData(encoded: string): Record<string, number> | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (!parsed.d || !parsed.s || !parsed.t) return null;
    if (hashCode(JSON.stringify(parsed.d) + parsed.t + SECRET) !== parsed.s) return null;
    const age = Date.now() - parsed.t;
    if (age > 7 * 24 * 60 * 60 * 1000) return null;
    return parsed.d as Record<string, number>;
  } catch {
    return null;
  }
}
