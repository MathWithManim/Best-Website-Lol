import { Client } from '@neondatabase/serverless';
export async function onRequestGet(context) {
  const client = new Client(context.env.DATABASE_URL);
  await client.connect();
  const { rows } = await client.query('SELECT current_database() as db');
  return new Response(JSON.stringify({ neon: true, db: rows[0].db }), { headers: { 'Content-Type': 'application/json' } });
}
