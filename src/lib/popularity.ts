/** Popularidade (o que os viajantes mais abrem): contagens dos últimos 90 dias, em memória por 1 hora. */
import { and, gte, isNotNull, sql } from "drizzle-orm";
import { db, schema } from "./db";

type Pop = { city: Map<string, number>; stop: Map<string, number> };
let cache: { at: number; v: Pop } | null = null;

export async function popularity(): Promise<Pop> {
  if (cache && Date.now() - cache.at < 3600_000) return cache.v;
  const v: Pop = { city: new Map(), stop: new Map() };
  try {
    const d = await db();
    const since = new Date(Date.now() - 90 * 86400_000);
    const e = schema.events;
    const cities = await d.select({ city: e.city, n: sql<number>`count(*)::int` }).from(e).where(and(gte(e.createdAt, since), isNotNull(e.city))).groupBy(e.city);
    for (const r of cities) if (r.city) v.city.set(r.city, r.n);
    const stops = await d.select({ city: e.city, stop: e.stop, n: sql<number>`count(*)::int` }).from(e).where(and(gte(e.createdAt, since), isNotNull(e.stop))).groupBy(e.city, e.stop);
    for (const r of stops) if (r.city && r.stop) v.stop.set(`${r.city}:${r.stop}`, r.n);
  } catch { /* sem base de dados: fica a ordem pela fama */ }
  cache = { at: Date.now(), v };
  return v;
}
