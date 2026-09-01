"use server";
import { db } from '../db';
import { users, globalStats } from '../db/schema';
import { eq } from 'drizzle-orm';
import auth from '../lib/auth';
// headers removed - using cookie-based session

export async function rollAction() {
  const session = await auth.api.getSession({ headers: await Promise.resolve({}) });
  if (!session) throw new Error('Unauthorized');
  const userRows = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  return { ok: true, rarity: 'Rare', boostApplied: false };
}
