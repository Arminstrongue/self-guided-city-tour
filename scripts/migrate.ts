/** Aplica as migrações SQL de ./drizzle à base de dados de DATABASE_URL. */
import { db } from "../src/lib/db";

async function main() {
  const url = process.env.DATABASE_URL ?? "pglite:./.data/db";
  const database = await db();
  if (url.startsWith("pglite:")) {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(database as never, { migrationsFolder: "./drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(database as never, { migrationsFolder: "./drizzle" });
  }
  console.log("Migrações aplicadas.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
