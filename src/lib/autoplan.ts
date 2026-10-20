/**
 * Plano automático: monta dias de viagem com lugares reais (momentos curados + lugares do Google/OSM),
 * escolhidos pelos interesses do viajante e pela hora certa (manhã, tarde, pôr do sol, noite).
 * Determinístico e sem IA: o resultado é sempre verificável e todos os lugares existem.
 */
import type { PlanItem } from "./db/schema";
import { CAT_HOBBIES, CAT_ICON, distM, type Hobby, type Place } from "./explore";
import type { When } from "@/data/moments";

export type Cand = { key: string; title: string; lat: number; lng: number; icon: string; h: Hobby[]; when: When | "any"; kind: "moment" | "place"; quality: number };

export function candidates(moments: { id: string; icon: string; when: When; h: Hobby[]; lat: number; lng: number; title: string }[], places: Place[]): Cand[] {
  return [
    ...moments.map((m) => ({ key: `m:${m.id}`, title: m.title, lat: m.lat, lng: m.lng, icon: m.icon, h: m.h, when: m.when, kind: "moment" as const, quality: 1.2 })),
    ...places.filter((p) => p.dist < 15000).map((p) => ({
      key: p.id, title: p.name, lat: p.lat, lng: p.lng, icon: CAT_ICON[p.cat], h: CAT_HOBBIES[p.cat],
      when: (p.cat === "nightlife" ? "night" : p.cat === "views" ? "sunset" : p.cat === "markets" ? "morning" : "any") as When | "any", kind: "place" as const,
      quality: p.rating ? Math.max(0, p.rating - 3.8) * Math.min(1, (p.reviews ?? 0) / 500) : 0.2
    }))
  ];
}

const SLOTS: { time: string; fits: (w: Cand["when"]) => boolean }[] = [
  { time: "09:30", fits: (w) => w === "morning" || w === "day" || w === "any" },
  { time: "11:30", fits: (w) => w === "day" || w === "any" || w === "weekend" },
  { time: "14:30", fits: (w) => w === "day" || w === "any" || w === "weekend" },
  { time: "16:30", fits: (w) => w === "day" || w === "any" },
  { time: "18:30", fits: (w) => w === "sunset" },
  { time: "21:00", fits: (w) => w === "night" }
];

export function autoPlan(cands: Cand[], hobbies: Hobby[], days: number, startDay = 1): PlanItem[] {
  const used = new Set<string>();
  const out: PlanItem[] = [];
  const score = (c: Cand) => c.h.filter((x) => hobbies.includes(x)).length * 2 + c.quality + (c.kind === "moment" ? 0.5 : 0);
  for (let d = 0; d < days; d++) {
    let last: { lat: number; lng: number } | null = null;
    for (const slot of SLOTS) {
      const pool = cands.filter((c) => !used.has(c.key) && slot.fits(c.when));
      if (!pool.length) continue;
      // Melhor equilíbrio entre interesse do viajante e distância ao lugar anterior (para não atravessar a cidade).
      const pick = pool.map((c) => ({ c, v: score(c) - (last ? distM(last, c) / 2500 : 0) })).sort((a, b) => b.v - a.v)[0].c;
      used.add(pick.key);
      last = pick;
      out.push({ id: `${pick.key}:${d}`.slice(0, 40), day: startDay + d, time: slot.time, title: pick.title, kind: pick.kind, lat: pick.lat, lng: pick.lng, icon: pick.icon });
    }
  }
  return out;
}

/** Rota do dia no Google Maps (até 9 paragens intermédias). */
export function dayRoute(items: { lat?: number; lng?: number }[]) {
  const pts = items.filter((i) => i.lat !== undefined && i.lng !== undefined).slice(0, 11) as { lat: number; lng: number }[];
  if (!pts.length) return null;
  const s = (p: { lat: number; lng: number }) => `${p.lat},${p.lng}`;
  const dest = pts[pts.length - 1];
  const way = pts.slice(0, -1).map(s).join("|");
  return `https://www.google.com/maps/dir/?api=1&destination=${s(dest)}&travelmode=walking${way ? `&waypoints=${encodeURIComponent(way)}` : ""}`;
}
