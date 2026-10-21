/**
 * "O que há de novo hoje" em cada cidade: um processo diário recolhe eventos, tempo, notícias de cultura e
 * o que está em alta na app (lugares mais visitados, #hashtags, comentários e publicações da semana).
 */
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { loadCities } from "./content";
import { cityName } from "@/data/cities";
import { eventsNear } from "./events";
import { weatherFor } from "./weather";
import { cultureNews } from "./news";
import { LOCALES } from "@/i18n/core";

export const today = (tz = "UTC") => new Intl.DateTimeFormat("sv-SE", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/** O que está em alta na app nesta cidade nos últimos 7 dias. */
export async function trendingIn(city: string) {
  const d = await db();
  const since = new Date(Date.now() - 7 * 86400_000);
  const [stops, posts, comments, visitors] = await Promise.all([
    d.select({ id: schema.checkins.stop, n: sql<number>`count(*)::int` }).from(schema.checkins).where(and(eq(schema.checkins.city, city), gte(schema.checkins.createdAt, since), sql`${schema.checkins.stop} <> ''`)).groupBy(schema.checkins.stop).orderBy(desc(sql`count(*)`)).limit(3),
    d.select({ text: schema.posts.text }).from(schema.posts).where(and(eq(schema.posts.city, city), eq(schema.posts.kind, "post"), gte(schema.posts.createdAt, since))).limit(300),
    d.select({ n: sql<number>`count(*)::int` }).from(schema.placeComments).where(and(eq(schema.placeComments.city, city), eq(schema.placeComments.hidden, false), gte(schema.placeComments.createdAt, since))),
    d.select({ n: sql<number>`count(distinct ${schema.checkins.email})::int` }).from(schema.checkins).where(and(eq(schema.checkins.city, city), gte(schema.checkins.createdAt, since)))
  ]);
  const tags = new Map<string, number>();
  for (const p of posts) for (const m of p.text.matchAll(/#([\p{L}\p{N}_]{2,40})/gu)) tags.set(m[1].toLowerCase(), (tags.get(m[1].toLowerCase()) ?? 0) + 1);
  return { stops, tags: [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, n]) => ({ tag, n })), comments: comments[0]?.n ?? 0, posts: posts.length, visitors: visitors[0]?.n ?? 0 };
}

/** Recolhe e guarda o resumo de hoje de uma cidade (eventos, tempo, notícias em todas as línguas, tendências). */
export async function buildPulse(cityId: string, log: (m: string) => void = () => undefined) {
  const c = (await loadCities()).find((x) => x.id === cityId);
  if (!c) return null;
  const center = { lat: c.stops[0].lat, lng: c.stops[0].lng };
  const day = today(c.tz);
  const [ev, wx, trending] = await Promise.all([
    eventsNear(c.id, center, 7).catch(() => null),
    weatherFor(center.lat, center.lng, c.tz ?? "UTC").catch(() => null),
    trendingIn(c.id)
  ]);
  const news: Record<string, { title: string; url: string; source: string; at: number }[]> = {};
  for (const l of LOCALES) {
    news[l] = (await cultureNews(cityName(c, l), l).catch((e) => { log(`news ${c.id}/${l}: ${e}`); return []; })).map((n) => ({ title: n.title, url: n.url, source: n.source, at: n.at }));
    await new Promise((r) => setTimeout(r, 300));
  }
  const temps = wx?.hours.map((h) => h.temp) ?? [];
  const data: schema.PulseData = {
    events: (ev ?? []).slice(0, 6).map((e) => ({ name: e.name, when: e.localTime ? `${e.localDate} ${e.localTime.slice(0, 5)}` : e.localDate, venue: e.venue ?? "", url: e.url, kind: e.kind })),
    weather: temps.length ? { min: Math.min(...temps), max: Math.max(...temps), rain: Math.max(...(wx?.hours.map((h) => h.rain) ?? [0])), code: wx?.now?.code ?? 0 } : null,
    trending, news
  };
  const d = await db();
  await d.insert(schema.cityPulse).values({ city: c.id, day, data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: [schema.cityPulse.city, schema.cityPulse.day], set: { data, updatedAt: new Date() } });
  // Guarda só os últimos 30 dias.
  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  await d.delete(schema.cityPulse).where(and(eq(schema.cityPulse.city, c.id), sql`${schema.cityPulse.day} < ${cutoff}`)).catch(() => null);
  return data;
}

/** O resumo mais recente de uma cidade (de hoje, ou do último dia recolhido). */
export async function latestPulse(city: string) {
  const d = await db();
  const [r] = await d.select().from(schema.cityPulse).where(eq(schema.cityPulse.city, city)).orderBy(desc(schema.cityPulse.day)).limit(1);
  return r ? { day: r.day, updatedAt: r.updatedAt.toISOString(), data: r.data } : null;
}
