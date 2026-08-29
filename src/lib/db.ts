import { Pool } from "pg";

export const pool = new Pool({
  connectionString: (process.env as any).HYPERDRIVE?.connectionString || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}
