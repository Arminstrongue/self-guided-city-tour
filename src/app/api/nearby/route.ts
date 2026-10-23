import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Serviços públicos por perto (OpenStreetMap): casas de banho, água potável, farmácias, multibanco, wifi.
 * Devolve o que ajuda a decidir "consigo usar isto agora?": horário, se é pago, acessibilidade e distância.
 */
const Q: Record<string, string[]> = {
  toilets: ['nwr["amenity"="toilets"]'],
  water: ['nwr["amenity"="drinking_water"]', 'nwr["drinking_water"="yes"]["amenity"="fountain"]'],
  pharmacy: ['nwr["amenity"="pharmacy"]'],
  atm: ['nwr["amenity"="atm"]', 'nwr["amenity"="bank"]["atm"="yes"]'],
  wifi: ['nwr["internet_access"="wlan"]["internet_access:fee"="no"]', 'nwr["internet_access"="wlan"]["amenity"="library"]'],
  charge: ['nwr["amenity"="charging_station"]["socket:schuko"]', 'nwr["device_charging_station"="yes"]']
};
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
type El = { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
const cache = new Map<string, { at: number; out: unknown }>();
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

export async function GET(req: Request) {
  if (!rateLimit(req, "nearby", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const kind = u.searchParams.get("kind") ?? "";
  const lat = Number(u.searchParams.get("lat")), lng = Number(u.searchParams.get("lng"));
  if (!Q[kind] || !Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ items: [] }, { status: 400 });
  const key = `${kind}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 6 * 3600_000) return NextResponse.json(hit.out);
  const around = `(around:1200,${lat},${lng})`;
  const data = `[out:json][timeout:15];(${Q[kind].map((q) => `${q}${around};`).join("")});out center 40;`;
  let els: El[] | null = null;
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, { method: "POST", body: new URLSearchParams({ data }).toString(), headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": env.ua }, signal: AbortSignal.timeout(14_000) });
      if (!r.ok) continue;
      els = ((await r.json()) as { elements?: El[] }).elements ?? [];
      break;
    } catch { /* tenta o seguinte */ }
  }
  if (!els) return NextResponse.json({ items: [], off: true });
  const me = { lat, lng };
  const items = els.map((e) => {
    const p = { lat: e.lat ?? e.center?.lat ?? NaN, lng: e.lon ?? e.center?.lon ?? NaN };
    const t = e.tags ?? {};
    return {
      id: e.id, lat: p.lat, lng: p.lng, m: Math.round(km(me, p) * 1000),
      name: t.name ?? t.operator ?? "", hours: t.opening_hours ?? "", fee: t.fee === "yes" ? "yes" : t.fee === "no" ? "no" : "",
      price: t.charge ?? "", wheelchair: t.wheelchair ?? "", changing: t.changing_table === "yes", access: t.access ?? "", indoor: t.indoor === "yes" || t.location === "indoor"
    };
  }).filter((x) => Number.isFinite(x.lat) && x.access !== "private" && x.access !== "customers").sort((a, b) => a.m - b.m).slice(0, 8);
  const out = { items };
  cache.set(key, { at: Date.now(), out });
  return NextResponse.json(out);
}
