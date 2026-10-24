import { NextResponse } from "next/server";
import { loadCities, loadCity } from "@/lib/content";
import { cityCenter } from "@/lib/explore";
import { km } from "@/lib/route-cost";
import { takeGoogle } from "@/lib/gbudget";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Hotel ou morada → coordenadas, para começar o percurso a partir dali. Google Places (se houver chave) ou OpenStreetMap. */
type Hit = { label: string; sub: string; lat: number; lng: number };
const cache = new Map<string, { at: number; hits: Hit[]; elsewhere?: { city: string; name: string } | null }>();

export async function GET(req: Request) {
  if (!rateLimit(req, "geocode", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") ?? "").trim().slice(0, 120);
  const lang = (u.searchParams.get("lang") ?? "en").slice(0, 5);
  const city = await loadCity(u.searchParams.get("city") ?? "");
  if (!city || q.length < 3) return NextResponse.json({ hits: [] });
  const key = `${city.id}|${lang}|${q.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 24 * 3600_000) return NextResponse.json({ hits: hit.hits, elsewhere: hit.elsewhere ?? null });
  const c = cityCenter(city);
  // Código postal (ex.: "M154DN", "SW1A 1AA", "10001", "1100-148"): pesquisa-o como está, sem juntar o nome da cidade.
  const ukPc = q.replace(/\s+/g, "").toUpperCase().match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/);
  const isPostcode = Boolean(ukPc) || /^\d{4,5}(-\d{3,4})?$/.test(q) || /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i.test(q);
  const query = ukPc ? `${ukPc[1]} ${ukPc[2]}` : q;
  const full = isPostcode ? query : `${query}, ${city.n.en}`;
  let hits: Hit[] = [];
  try {
    if (process.env.GOOGLE_PLACES_API_KEY && takeGoogle("search")) {
      const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY, "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location" },
        body: JSON.stringify({ textQuery: full, languageCode: lang, pageSize: 5, locationBias: { circle: { center: { latitude: c.lat, longitude: c.lng }, radius: 30000 } } }),
        signal: AbortSignal.timeout(8000), cache: "no-store"
      });
      if (r.ok) {
        const j = (await r.json()) as { places?: { displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number } }[] };
        hits = (j.places ?? []).filter((p) => p.location).map((p) => ({ label: p.displayName?.text ?? q, sub: p.formattedAddress ?? "", lat: p.location!.latitude, lng: p.location!.longitude }));
      }
    }
    if (!hits.length) {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=${lang}&q=${encodeURIComponent(full)}`, {
        headers: { "User-Agent": env.ua }, signal: AbortSignal.timeout(8000), cache: "no-store"
      });
      if (r.ok) {
        const j = (await r.json()) as { name?: string; display_name: string; lat: string; lon: string }[];
        hits = j.map((p) => ({ label: p.name || p.display_name.split(",")[0], sub: p.display_name.split(",").slice(1, 4).join(",").trim(), lat: +p.lat, lng: +p.lon }));
      }
    }
  } catch { /* sem resultados */ }
  // Só dentro da cidade; se a morada for noutra cidade da app, diz qual (para o viajante poder mudar).
  const inside = hits.filter((h) => km(h, c) < 60);
  let elsewhere: { city: string; name: string } | null = null;
  if (!inside.length && hits.length) {
    const all = await loadCities();
    const best = all.map((x) => ({ x, d: km(hits[0], cityCenter(x)) })).sort((a, b) => a.d - b.d)[0];
    if (best && best.d < 60 && best.x.id !== city.id) elsewhere = { city: best.x.id, name: best.x.n[lang as keyof typeof best.x.n] ?? best.x.n.en };
  }
  cache.set(key, { at: Date.now(), hits: inside, elsewhere });
  return NextResponse.json({ hits: inside, elsewhere });
}
