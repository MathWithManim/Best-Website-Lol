import { Client } from "pg";
export interface Env { HYPERDRIVE?: { connectionString: string } }

export async function onRequest(context: { env: Env; request: Request }) {
  const client = new Client({ connectionString: context.env.HYPERDRIVE?.connectionString });
  await client.connect();
  try {
    const { rows } = await client.query("SELECT email, rarityCounts, created_at FROM users");
    return new Response(JSON.stringify({ ok: true, count: rows.length, users: rows }), {
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.end();
  }
}
