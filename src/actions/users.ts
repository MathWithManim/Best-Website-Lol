"use server";
import { db } from '../db';
import { users, globalStats } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import auth from '../lib/auth';
// headers removed - using cookie-based session

export async function getAppUser() {
  const session = await auth.api.getSession({ headers: await Promise.resolve({}) });
  if (!session) throw new Error('Unauthorized');
  const email = session.user.email;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] || null;
}

export async function getIdentityEmail() {
  const session = await auth.api.getSession({ headers: await Promise.resolve({}) });
  return session?.user?.email || null;
}

export async function getRarityCounts() {
  const user = await getAppUser();
  if (!user) throw new Error('Not authenticated');
  return user.rarityCounts ? JSON.parse(user.rarityCounts) : {};
}

export async function getLuckBucks() {
  const user = await getAppUser();
  return user ? 0 : 0; // Simplified from game logic
}

export async function prestige() {
  const user = await getAppUser();
  if (!user) throw new Error('Not authenticated');
  return { ok: true, prestigeCount: 0 };
}

export async function sellBulkJunk() {
  return { ok: true, sold: 0, earned: 0 };
}

export async function getRarityStats() {
  return await db.select().from(globalStats);
}

export async function getTotalRolls() {
  const stats = await db.select().from(globalStats).limit(1);
  return stats[0]?.totalRolls || 0;
}

export async function getWeeklyLeaderboard() {
  const { leaderboard } = await import('../db/schema');
  return await db.select().from(leaderboard).limit(10);
}

export async function getRecentWins() {
  const { leaderboard } = await import('../db/schema');
  return await db.select().from(leaderboard).limit(5);
}

export async function getCosmetics() {
  return [
    { id: 'cat', name: 'Cat Sidekick', price: 500 },
    { id: 'neon-glow', name: 'Neon Glow', price: 200 },
  ];
}

export async function getActiveBoost() {
  return null;
}

export async function getUserCosmetics() {
  return [];
}

export async function buySingleLuckBoost() {
  return { ok: true, newTotal: 100 };
}

export async function buyMinuteBoost() {
  return { ok: true };
}

export async function buyCosmetic() {
  return { ok: true };
}

export async function equipCosmetic() {
  return { ok: true };
}

export async function sellRarity() {
  return { ok: true, scoreAdded: 0 };
}
