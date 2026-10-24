import { NextResponse } from "next/server";
import { loadCities } from "@/lib/content";
import { cityCenterOf } from "@/lib/city-center";
import { activeOffers } from "@/lib/merchants";
import { rateLimit } from "@/lib/rate-limit";

const KINDS: Record<string, string[]> = { food: ["food", "cafe"], bag: ["bag"] };
const m = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371e3, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Só negócios registados e ativos na VOYBU (regra da app), do mais perto para o mais longe. */
export async function GET(req: Request) {
  if (!rateLimit(req, "partners-near", 30)) return NextResponse.json({ items: [] }, { status: 429 });
  const u = new URL(req.url);
  const lat = Number(u.searchParams.get("lat")), lng = Number(u.searchParams.get("lng"));
  const cats = KINDS[u.searchParams.get("kind") ?? ""] ?? [];
  if (!cats.length || !Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ items: [] }, { status: 400 });
  const me = { lat, lng };
  const city = (await loadCities()).map((c) => ({ c, d: m(me, cityCenterOf(c)) })).sort((a, b) => a.d - b.d)[0];
  if (!city || city.d > 40_000) return NextResponse.json({ items: [] });
  const items = (await activeOffers(city.c.id))
    .filter((o) => cats.includes(o.category) && o.lat !== null && o.lng !== null)
    .map((o) => ({ id: o.id, name: o.name, offer: o.offer, hours: o.hours ?? "", lat: o.lat as number, lng: o.lng as number, m: Math.round(m(me, { lat: o.lat as number, lng: o.lng as number })), photo: o.photos > 0, featured: o.featured }))
    .filter((o) => o.m <= 3000).sort((a, b) => Number(b.featured) - Number(a.featured) || a.m - b.m).slice(0, 10);
  return NextResponse.json({ items });
}
