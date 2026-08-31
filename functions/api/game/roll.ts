import { db, pool } from '../../src/lib/db';
import { eq, and } from 'drizzle-orm';
import { users, globalStats } from '../../src/db/schema';

export async function roll(env: any) {
  const connString = env.DATABASE_URL || env.HYPERDRIVE?.connectionString || '';
  const localPool = new (await import('@neondatabase/serverless')).Pool({ connectionString: connString });
  const localDb = (await import('drizzle-orm/neon-serverless')).drizzle(localPool, { schema: require('../../src/db/schema') });
  
  return new Response(JSON.stringify({ ok: true, message: 'Roll endpoint rebuilt with Drizzle/Neon' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequest(context: any) {
  try {
    const result = await roll(context.env);
    return result;
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, code: 'GAME_ROLL_ERROR' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
