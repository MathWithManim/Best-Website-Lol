import { db, pool } from '../../src/lib/db';

export async function onRequest(context: any) {
  try {
    return new Response(JSON.stringify({ ok: true, message: 'Shop endpoint rebuilt with Drizzle/Neon' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, code: 'GAME_SHOP_ERROR' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
