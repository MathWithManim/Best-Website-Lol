import { Client } from "pg";

export function getClient(env: { HYPERDRIVE?: { connectionString: string } }) {
  return new Client({
    connectionString: env.HYPERDRIVE?.connectionString,
  });
}
