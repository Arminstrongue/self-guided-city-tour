/**
 * Dados de demonstração para desenvolvimento (NÃO usar em produção):
 * dois comerciantes de exemplo em Lisboa e um acesso para demo@example.com.
 * Imprime um link de acesso para abrir o roteiro sem pagar.
 */
import { db, schema } from "../src/lib/db";
import { createAccessToken } from "../src/lib/access-token";

async function main() {
  const d = await db();
  await d.insert(schema.merchants).values([
    { name: "Pastelaria Exemplo", category: "cafe", city: "lis", stopId: "rossio", offer: "Café + pastel de nata por 2 €", email: "exemplo1@example.com", plan: "featured", status: "active", refCode: "DEMO001" },
    { name: "Guarda-Malas Exemplo", category: "bag", city: "lis", stopId: "comercio", offer: "Guarde a mala por 4 € até 6 h", email: "exemplo2@example.com", plan: "partner", status: "active", refCode: "DEMO002" }
  ]).onConflictDoNothing();
  await d.insert(schema.accesses).values({
    email: "demo@example.com", scope: "all", city: null, amountCents: 0, stripeSessionId: "demo_seed",
    flightAt: new Date(Date.now() + 9 * 3600_000), expiresAt: new Date(Date.now() + 30 * 24 * 3600_000), locale: "pt"
  }).onConflictDoNothing();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  console.log(`Link de demonstração: ${base}/api/access/link?token=${encodeURIComponent(createAccessToken("demo@example.com"))}&locale=pt&city=lis`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
