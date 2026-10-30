/**
 * Pesquisa global da app: cidades, paragens dos roteiros, pessoas, #hashtags e guias — numa só caixa.
 * Ignora acentos e maiúsculas ("sao jorge" encontra "Castelo de São Jorge").
 */
import { openCities } from "./city-access";
import { isFreeCity } from "./pricing";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { loadCities } from "./content";
import { cityName, COUNTRY } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { LOCALES } from "@/i18n/core";
import { search as searchPeople } from "./social";

export const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export type SearchResult = {
  cities: { id: string; name: string; country: string }[];
  stops: { city: string; cityName: string; id: string; name: string; top: boolean }[];
  people: Awaited<ReturnType<typeof searchPeople>>;
  tags: { tag: string; n: number }[];
  guides: { id: string; name: string; city: string; cityName: string; photo: boolean; rating: number | null }[];
};

export async function globalSearch(me: string | null, raw: string, locale: string): Promise<SearchResult> {
  const q = fold(raw.replace(/^[#@]/, "")).slice(0, 40);
  const empty: SearchResult = { cities: [], stops: [], people: [], tags: [], guides: [] };
  if (q.length < 2) return empty;
  const cities = await loadCities();
  const nameOf = new Map(cities.map((c) => [c.id, cityName(c, locale)]));
  const out: SearchResult = { ...empty };

  if (!raw.startsWith("#") && !raw.startsWith("@")) {
    out.cities = cities.filter((c) => c.id === q || LOCALES.some((l) => fold(cityName(c, l)).includes(q)) || fold(COUNTRY[c.id] ?? "") === q)
      .slice(0, 6).map((c) => ({ id: c.id, name: cityName(c, locale), country: COUNTRY[c.id] ?? "" }));
    const stops: SearchResult["stops"] = [];
    // Os nomes das paragens são conteúdo pago: só aparecem nas cidades que este viajante pode abrir (Manchester é grátis).
    const open = await openCities().catch(() => (id: string) => isFreeCity(id));
    for (const c of cities) if (open(c.id)) for (const s of c.stops) {
      if (fold(stopName(s, locale)).includes(q)) stops.push({ city: c.id, cityName: nameOf.get(c.id)!, id: s.id, name: stopName(s, locale), top: Boolean(s.top) });
    }
    stops.sort((a, b) => Number(fold(b.name).startsWith(q)) - Number(fold(a.name).startsWith(q)) || Number(b.top) - Number(a.top));
    out.stops = stops.slice(0, 8);
  }

  const d = await db();
  if (!raw.startsWith("#")) out.people = me ? (await searchPeople(me, q)).slice(0, 6) : [];

  if (!raw.startsWith("@")) {
    // #hashtags usadas em publicações públicas recentes que começam pelo termo.
    const rows = await d.select({ text: schema.posts.text }).from(schema.posts)
      .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
      .where(and(eq(schema.posts.kind, "post"), eq(schema.travellerProfiles.isPrivate, false), sql`${schema.posts.text} ilike ${`%#%`}`))
      .orderBy(desc(schema.posts.createdAt)).limit(400);
    const count = new Map<string, number>();
    for (const r of rows) for (const m of r.text.matchAll(/#([\p{L}\p{N}_]{2,40})/gu)) {
      const tag = m[1].toLowerCase();
      if (fold(tag).startsWith(q)) count.set(tag, (count.get(tag) ?? 0) + 1);
    }
    out.tags = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag, n]) => ({ tag, n }));
  }

  if (!raw.startsWith("#") && !raw.startsWith("@")) {
    const cityIds = cities.filter((c) => LOCALES.some((l) => fold(cityName(c, l)).includes(q))).map((c) => c.id);
    const g = await d.select().from(schema.guides).where(and(eq(schema.guides.status, "active"), eq(schema.guides.payoutsReady, true),
      or(ilike(schema.guides.name, `%${q.replace(/[%_\\]/g, "")}%`), cityIds.length ? sql`${schema.guides.city} in (${sql.join(cityIds.map((c) => sql`${c}`), sql`, `)})` : sql`false`))).limit(4);
    out.guides = g.map((x) => ({ id: x.id, name: x.name, city: x.city, cityName: nameOf.get(x.city) ?? x.city, photo: Boolean(x.photo), rating: x.ratingCount ? Math.round((x.ratingSum / x.ratingCount) * 10) / 10 : null }));
  }
  return out;
}
