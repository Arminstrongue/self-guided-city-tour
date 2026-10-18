/**
 * Métricas do funil ("Metrics to Live and Die By"): contagens anónimas por evento, sem cookies nem dados pessoais,
 * mais as compras (tabela accesses) e as avaliações no fim do roteiro (estrelas + NPS).
 */
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "./db";

export const EVENTS = ["view_city", "checkout_start", "tour_open", "stop_done", "tour_done", "sos_open", "share_loc", "rating_open"] as const;
export type EventName = (typeof EVENTS)[number];
export const isEvent = (v: unknown): v is EventName => typeof v === "string" && (EVENTS as readonly string[]).includes(v);

const clip = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n).replace(/[^\w\-:.]/g, "") || null : null);

export async function track(e: { name: EventName; city?: unknown; stop?: unknown; locale?: unknown; ref?: unknown; platform?: unknown }) {
  const d = await db();
  await d.insert(schema.events).values({
    name: e.name, city: clip(e.city, 8), stop: clip(e.stop, 40), locale: clip(e.locale, 5), ref: clip(e.ref, 24), platform: clip(e.platform, 10)
  });
}

export type RatingInput = { stars: number; nps?: number | null; comment?: string | null; locale?: string | null };
export function validRating(r: Partial<RatingInput>): RatingInput | null {
  const stars = Number(r.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return null;
  const n = r.nps === null || r.nps === undefined || (r.nps as unknown) === "" ? null : Number(r.nps);
  if (n !== null && (!Number.isInteger(n) || n < 0 || n > 10)) return null;
  const comment = typeof r.comment === "string" ? r.comment.trim().slice(0, 1000) || null : null;
  return { stars, nps: n, comment, locale: typeof r.locale === "string" ? r.locale.slice(0, 5) : null };
}

/** Grava (ou atualiza) a avaliação de uma compra para uma cidade. */
export async function saveRating(accessId: string, city: string, r: RatingInput) {
  const d = await db();
  const [row] = await d.insert(schema.ratings).values({ accessId, city, ...r })
    .onConflictDoUpdate({ target: [schema.ratings.accessId, schema.ratings.city], set: { stars: r.stars, nps: r.nps, comment: r.comment, locale: r.locale } })
    .returning();
  return row;
}

/** NPS = % promotores (9–10) − % detratores (0–6). */
export function npsScore(values: number[]): number | null {
  if (!values.length) return null;
  const pro = values.filter((v) => v >= 9).length, det = values.filter((v) => v <= 6).length;
  return Math.round(((pro - det) / values.length) * 100);
}

export type Dashboard = Awaited<ReturnType<typeof dashboard>>;

export async function dashboard(days: number) {
  const d = await db();
  const since = new Date(Date.now() - days * 86400_000);
  const ev = await d.select({ name: schema.events.name, city: schema.events.city, n: sql<number>`count(*)::int` })
    .from(schema.events).where(gte(schema.events.createdAt, since)).groupBy(schema.events.name, schema.events.city);
  const sales = await d.select({ city: sql<string>`coalesce(${schema.accesses.city}, 'all')`, n: sql<number>`count(*)::int`, cents: sql<number>`coalesce(sum(${schema.accesses.amountCents}),0)::int` })
    .from(schema.accesses).where(gte(schema.accesses.createdAt, since)).groupBy(sql`1`);
  const rates = await d.select().from(schema.ratings).where(gte(schema.ratings.createdAt, since)).orderBy(desc(schema.ratings.createdAt));
  const daily = await d.select({ day: sql<string>`to_char(${schema.accesses.createdAt}, 'YYYY-MM-DD')`, n: sql<number>`count(*)::int`, cents: sql<number>`coalesce(sum(${schema.accesses.amountCents}),0)::int` })
    .from(schema.accesses).where(gte(schema.accesses.createdAt, since)).groupBy(sql`1`).orderBy(sql`1`);

  const sum = (name: string, city?: string | null) => ev.filter((e) => e.name === name && (city === undefined || e.city === city)).reduce((a, e) => a + e.n, 0);
  const purchases = sales.reduce((a, s) => a + s.n, 0);
  const revenue = sales.reduce((a, s) => a + s.cents, 0);
  const funnel = [
    { key: "view_city", n: sum("view_city") },
    { key: "checkout_start", n: sum("checkout_start") },
    { key: "purchase", n: purchases },
    { key: "tour_open", n: sum("tour_open") },
    { key: "tour_done", n: sum("tour_done") },
    { key: "rating", n: rates.length }
  ];
  const cities = [...new Set([...ev.map((e) => e.city), ...sales.map((s) => s.city)].filter((c): c is string => Boolean(c)))];
  const byCity = cities.map((c) => {
    const s = sales.find((x) => x.city === c);
    const r = rates.filter((x) => x.city === c);
    return {
      city: c, views: sum("view_city", c), checkouts: sum("checkout_start", c), purchases: s?.n ?? 0, revenue: s?.cents ?? 0,
      done: sum("tour_done", c), stars: r.length ? r.reduce((a, x) => a + x.stars, 0) / r.length : null, ratings: r.length
    };
  }).sort((a, b) => b.purchases - a.purchases || b.views - a.views);
  const npsVals = rates.map((r) => r.nps).filter((v): v is number => v !== null);
  return {
    days, funnel, purchases, revenue, byCity, daily,
    stars: rates.length ? rates.reduce((a, r) => a + r.stars, 0) / rates.length : null,
    nps: npsScore(npsVals), npsN: npsVals.length,
    sos: sum("sos_open"), shares: sum("share_loc"),
    comments: rates.filter((r) => r.comment).slice(0, 20)
  };
}

export async function ratingFor(accessId: string, city: string) {
  const d = await db();
  const [r] = await d.select().from(schema.ratings).where(and(eq(schema.ratings.accessId, accessId), eq(schema.ratings.city, city))).limit(1);
  return r ?? null;
}
