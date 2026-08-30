import type { Client as PgClient } from "pg";

export interface Env {
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
}

export async function onRequest(context: { env: Env; request: Request }) {
  let client: PgClient | null = null;
  try {
    const connectionString =
      context.env.HYPERDRIVE?.connectionString ||
      context.env.DATABASE_URL ||
      (process.env as any)?.DATABASE_URL;

    if (!connectionString) {
      return new Response(
        JSON.stringify({ error: "DATABASE_URL / HYPERDRIVE connection string is not set in environment!", code: "DB_INIT_FAILURE" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { Client } = await import("pg");
    client = new Client({ connectionString });
    await client.connect();

    const { rows } = await client.query(
      `SELECT email, rarity_counts AS "rarityCounts", created_at AS "createdAt" FROM users`
    );
    return new Response(JSON.stringify({ ok: true, count: rows.length, users: rows }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Internal Server Error listing users",
        code: "USERS_LIST_FAILURE",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {}
    }
  }
}