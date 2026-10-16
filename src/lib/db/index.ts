import * as schema from "./schema";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

declare global { var __sgctDb: Promise<DB> | undefined } // eslint-disable-line no-var

async function connect(): Promise<DB> {
  const url = process.env.DATABASE_URL ?? "pglite:./.data/db";
  if (url.startsWith("pglite:")) {
    // Desenvolvimento: PostgreSQL em WebAssembly, sem servidor.
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const dir = url.slice("pglite:".length) || undefined;
    if (dir && dir !== "memory") (await import("node:fs")).mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir === "memory" ? undefined : dir);
    return drizzle(client, { schema }) as unknown as DB;
  }
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  // Ligações por instância: com várias réplicas, total = réplicas × DB_POOL_MAX (ver SCALING.md).
  const pool = new Pool({ connectionString: url, max: Number(process.env.DB_POOL_MAX ?? 10), idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
  return drizzle(pool, { schema }) as unknown as DB;
}

/** Ligação única por processo (reutilizada entre pedidos e hot reloads). */
export function db(): Promise<DB> {
  if (!globalThis.__sgctDb) globalThis.__sgctDb = connect();
  return globalThis.__sgctDb;
}
export { schema };
