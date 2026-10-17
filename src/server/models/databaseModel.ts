import "dotenv/config";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool, PoolClient, QueryResult, types } from "pg";

types.setTypeParser(20, (value) => Number(value));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be configured before starting the server.");
}

const sslCa = process.env.PGSSL_CA;
const pool = new Pool({
  connectionString,
  max: process.env.VERCEL ? 5 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: {
    rejectUnauthorized: true,
    ...(sslCa ? { ca: sslCa.replace(/\\n/g, "\n") } : {}),
  },
});

const transactionClient = new AsyncLocalStorage<PoolClient>();

export async function query<T = any>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  const client = transactionClient.getStore() ?? pool;
  return client.query<T>(text, values);
}

export async function transaction<T>(operation: () => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await transactionClient.run(client, operation);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

let initialization: Promise<void> | undefined;

export function initializeDatabase(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      const schemaPath = path.resolve(process.cwd(), "database.sql");
      const schema = readFileSync(schemaPath, "utf8");
      await query(schema);
      await query("SELECT 1");
    })().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
