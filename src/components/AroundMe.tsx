"use client";
/**
 * "À sua volta" no roteiro pago: o que está a acontecer perto, enquanto se caminha, sem ter de procurar.
 * Junta avisos de outros viajantes, eventos de hoje, museus abertos agora, momentos locais e serviços (WC, água),
 * ordenados pela distância e atualizados a cada ~150 m. Um toque mostra no mapa.
 * Quando um aviso ou um evento fica a menos de ~150 m, o telemóvel vibra uma vez (para não ter de olhar).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { MOMENTS } from "@/data/moments";
import { openNow, type Museum } from "@/data/museums";
import type { PublicUpdate } from "@/lib/updates";
import { UPDATE_ICON } from "./TravellerUpdates";
import type { Focus } from "./MapView";

type Pos = { lat: number; lng: number };
type Item = { key: string; icon: string; title: string; meta: string; lat: number; lng: number; m: number; ping?: boolean };
type Ev = { id: string; name: string; lat: number | null; lng: number | null; localDate: string; localTime: string | null; free?: boolean; status?: string };
type Svc = { id: number; lat: number; lng: number; m: number; name: string; fee: string };

const R = 6371000;
const dist = (a: Pos, b: Pos) => {
  const x = ((b.lng - a.lng) * Math.PI / 180) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = (b.lat - a.lat) * Math.PI / 180;
  return Math.round(Math.sqrt(x * x + y * y) * R);
};
const NEAR = 900;        // até onde mostrar (metros)
const PING = 150;        // vibrar quando um aviso/evento fica a esta distância
const REFETCH = 300;     // pedir serviços outra vez depois de andar isto

export function AroundMe({ t, locale, cityId, tz, pos, geoState, onGeo, museums, updates, onShow }: {
  t: Dict; locale: Locale; cityId: string; tz: string; pos: Pos | null; geoState: "off" | "on" | "denied"; onGeo: () => void;
  museums: Museum[]; updates: PublicUpdate[] | null; onShow: (f: Focus) => void;
}) {
  const a = t.am;
  const [events, setEvents] = useState<Ev[]>([]);
  const [svc, setSvc] = useState<{ toilets: Svc[]; water: Svc[] }>({ toilets: [], water: [] });
  const lastSvc = useRef<Pos | null>(null);
  const pinged = useRef<Set<string>>(new Set());

  // Eventos de hoje (uma vez por cidade; a API já está guardada em cache).
  useEffect(() => {
    let on = true;
    fetch(`/api/explore?city=${cityId}&l=${locale}`).then((r) => (r.ok ? r.json() : null))
      .then((j: { events?: Ev[] | null } | null) => { if (on) setEvents((j?.events ?? []).filter((e) => e.lat != null && e.lng != null && e.status !== "cancelled")); })
      .catch(() => {});
    return () => { on = false; };
  }, [cityId, locale]);

  // Casa de banho e água mais perto: só quando há posição e depois de andar ~300 m (poupa pedidos e bateria).
  useEffect(() => {
    if (!pos) return;
    if (lastSvc.current && dist(lastSvc.current, pos) < REFETCH) return;
    lastSvc.current = pos;
    const get = (kind: "toilets" | "water") => fetch(`/api/nearby?kind=${kind}&lat=${pos.lat}&lng=${pos.lng}`).then((r) => (r.ok ? r.json() : null)).then((j: { items?: Svc[] } | null) => j?.items ?? []).catch(() => [] as Svc[]);
    void Promise.all([get("toilets"), get("water")]).then(([toilets, water]) => setSvc({ toilets, water }));
  }, [pos]);

  const today = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()), [tz]);
  const walk = (m: number) => `${m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`} · ${Math.max(1, Math.round(m / 80))} min`;

  const items = useMemo<Item[]>(() => {
    if (!pos) return [];
    const out: Item[] = [];
    for (const u of updates ?? []) if (u.lat != null && u.lng != null) {
      const m = dist(pos, { lat: u.lat, lng: u.lng });
      if (m <= NEAR) out.push({ key: `u${u.id}`, icon: UPDATE_ICON[u.kind], title: u.text, meta: walk(m), lat: u.lat, lng: u.lng, m: m - (u.kind === "alert" || u.kind === "warn" ? 400 : 0), ping: u.kind === "alert" || u.kind === "warn" });
    }
    for (const e of events) if (e.localDate === today) {
      const m = dist(pos, { lat: e.lat!, lng: e.lng! });
      if (m <= NEAR * 2) out.push({ key: `e${e.id}`, icon: "🎟", title: e.name, meta: `${e.localTime ? fmt(a.today, { t: e.localTime.slice(0, 5) }) + " · " : ""}${e.free ? `${t.free} · ` : ""}${walk(m)}`, lat: e.lat!, lng: e.lng!, m, ping: true });
    }
    for (const mu of museums) {
      const o = openNow(mu, tz);
      if (!o.open) continue;
      const m = dist(pos, mu);
      if (m <= NEAR) out.push({ key: `m${mu.id}`, icon: "🏛", title: mu.n, meta: `${o.today ? fmt(a.until, { t: o.today[1] }) + " · " : ""}${mu.price === 0 ? `${t.free} · ` : ""}${walk(m)}`, lat: mu.lat, lng: mu.lng, m });
    }
    for (const mo of MOMENTS[cityId] ?? []) {
      const m = dist(pos, mo);
      if (m <= NEAR) out.push({ key: `o${mo.id}`, icon: mo.icon, title: (locale === "pt" ? mo.pt : mo.en)[0], meta: walk(m), lat: mo.lat, lng: mo.lng, m });
    }
    const t0 = svc.toilets[0], w0 = svc.water[0];
    if (t0) out.push({ key: `t${t0.id}`, icon: "🚻", title: t0.name || a.toilet, meta: `${t0.fee === "no" ? `${t.free} · ` : ""}${walk(dist(pos, t0))}`, lat: t0.lat, lng: t0.lng, m: dist(pos, t0) + 50 });
    if (w0) out.push({ key: `w${w0.id}`, icon: "💧", title: w0.name || a.water, meta: walk(dist(pos, w0)), lat: w0.lat, lng: w0.lng, m: dist(pos, w0) + 80 });
    return out.sort((x, y) => x.m - y.m).slice(0, 8);
  }, [pos, updates, events, museums, svc, cityId, locale, tz, today]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sem olhar: uma vibração curta quando um aviso ou evento fica muito perto (uma vez por item).
  useEffect(() => {
    if (!pos) return;
    for (const it of items) if (it.ping && dist(pos, it) <= PING && !pinged.current.has(it.key)) {
      pinged.current.add(it.key);
      try { navigator.vibrate?.([60, 80, 60]); } catch { /* ignorar */ }
    }
  }, [items, pos]);

  if (!pos) {
    return (
      <section className="am card" aria-label={a.title}>
        <div className="am-h"><b>📍 {a.title}</b></div>
        <button type="button" className="btn press am-on" onClick={onGeo} disabled={geoState === "denied"}>{geoState === "denied" ? a.denied : a.on}</button>
      </section>
    );
  }
  return (
    <section className="am card" aria-label={a.title}>
      <div className="am-h"><b>📍 {a.title}</b><small>{a.sub}</small></div>
      {items.length === 0 ? <p className="am-none">{a.none}</p> : (
        <div className="am-rail">
          {items.map((it) => (
            <button key={it.key} type="button" className={`am-chip press${it.ping ? " hot" : ""}`} onClick={() => onShow({ lat: it.lat, lng: it.lng, name: it.title, walk: true })}>
              <span className="am-ic" aria-hidden="true">{it.icon}</span>
              <span className="am-tx"><b>{it.title}</b><small className="num">{it.meta}</small></span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
