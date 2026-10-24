import { and, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "./db";

export const REPORT_KINDS = ["entrance", "closed", "price", "access", "other"] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];
/** A partir de quantos relatos em aberto (pessoas diferentes, últimos 30 dias) a paragem mostra um aviso de incerteza. */
export const WARN_AT = 3;

export async function addStopReport(city: string, stop: string, kind: ReportKind, note: string, reporter: string) {
  const d = await db();
  // Uma pessoa conta uma vez por paragem e tipo (repetir não reforça o aviso).
  const dup = await d.select({ id: schema.stopReports.id }).from(schema.stopReports)
    .where(and(eq(schema.stopReports.city, city), eq(schema.stopReports.stop, stop), eq(schema.stopReports.kind, kind), eq(schema.stopReports.reporter, reporter), eq(schema.stopReports.status, "open"))).limit(1);
  if (dup.length) { if (note) await d.update(schema.stopReports).set({ note }).where(eq(schema.stopReports.id, dup[0].id)); return; }
  await d.insert(schema.stopReports).values({ city, stop, kind, note, reporter });
}

/** Avisos ativos numa cidade: paragem → tipos com relatos suficientes. */
export async function stopWarnings(city: string): Promise<Record<string, ReportKind[]>> {
  const d = await db();
  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  const rows = await d.select({ stop: schema.stopReports.stop, kind: schema.stopReports.kind, n: sql<number>`count(distinct ${schema.stopReports.reporter})::int` })
    .from(schema.stopReports).where(and(eq(schema.stopReports.city, city), eq(schema.stopReports.status, "open"), gte(schema.stopReports.createdAt, since)))
    .groupBy(schema.stopReports.stop, schema.stopReports.kind);
  const out: Record<string, ReportKind[]> = {};
  for (const r of rows) if (r.n >= WARN_AT) (out[r.stop] ??= []).push(r.kind as ReportKind);
  return out;
}

/** Para o painel: relatos em aberto agrupados por paragem e tipo. */
export async function openStopReports() {
  const d = await db();
  return d.select({ city: schema.stopReports.city, stop: schema.stopReports.stop, kind: schema.stopReports.kind,
    n: sql<number>`count(*)::int`, notes: sql<string[]>`array_remove(array_agg(nullif(${schema.stopReports.note}, '')), null)`, last: sql<Date>`max(${schema.stopReports.createdAt})` })
    .from(schema.stopReports).where(eq(schema.stopReports.status, "open"))
    .groupBy(schema.stopReports.city, schema.stopReports.stop, schema.stopReports.kind).orderBy(sql`count(*) desc`).limit(50);
}

export async function closeStopReports(city: string, stop: string, kind: string, status: "fixed" | "dismissed") {
  const d = await db();
  await d.update(schema.stopReports).set({ status }).where(and(eq(schema.stopReports.city, city), eq(schema.stopReports.stop, stop), eq(schema.stopReports.kind, kind), eq(schema.stopReports.status, "open")));
}
