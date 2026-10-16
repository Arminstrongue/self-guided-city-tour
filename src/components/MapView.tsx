"use client";
/** Mapa OpenStreetMap (Leaflet) dentro da app: roteiro, museus, aeroporto e a posição do viajante. */
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import type { Airport, Stop } from "@/data/cities";
import type { Museum } from "@/data/museums";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/dictionaries";
import { km, walkMin } from "@/lib/route-cost";
import { ExtLink } from "./ExtLink";

const TILES = process.env.NEXT_PUBLIC_MAP_TILES || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "© OpenStreetMap";

export type Focus = { lat: number; lng: number; name: string; walk: boolean };
type Pos = { lat: number; lng: number };

export function osmWalk(from: Pos | null, to: Pos) {
  return from
    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${from.lat},${from.lng};${to.lat},${to.lng}`
    : `https://www.openstreetmap.org/?mlat=${to.lat}&mlon=${to.lng}#map=17/${to.lat}/${to.lng}`;
}
export function transitLink(to: Pos) {
  return `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=transit`;
}

export function MapView({ stops, done, museums, airport, pos, focus, t }: {
  stops: Stop[]; done: Record<string, boolean>; museums: Museum[]; airport?: Airport; pos: Pos | null; focus: Focus | null; t: Dict;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const viewKey = useRef("");

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { zoomControl: true, attributionControl: true });
      L.tileLayer(TILES, { maxZoom: 19, attribution: ATTR }).addTo(m);
      layer.current = L.layerGroup().addTo(m);
      map.current = m;
      draw(L);
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { void import("leaflet").then((L) => draw(L)); });

  function draw(L: typeof import("leaflet")) {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const icon = (html: string, cls: string) => L.divIcon({ html, className: `mk ${cls}`, iconSize: [28, 28], iconAnchor: [14, 14] });
    L.polyline(stops.map((s) => [s.lat, s.lng] as [number, number]), { color: "#1d4aa0", weight: 4, opacity: 0.8 }).addTo(g);
    stops.forEach((s, i) => L.marker([s.lat, s.lng], { icon: icon(done[s.id] ? "✓" : String(i + 1), done[s.id] ? "done" : "stop") }).bindPopup(`<b>${esc(s.n)}</b><br>${esc(s.a)}`).addTo(g));
    museums.forEach((x) => L.marker([x.lat, x.lng], { icon: icon("🏛", "mus") }).bindPopup(`<b>${esc(x.n)}</b>`).addTo(g));
    if (airport) L.marker([airport.lat, airport.lng], { icon: icon("✈", "air") }).bindPopup(`<b>${esc(airport.name)}</b>`).addTo(g);
    if (pos) L.circleMarker([pos.lat, pos.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2b7cff", fillOpacity: 1 }).addTo(g);
    if (focus) {
      L.marker([focus.lat, focus.lng], { icon: icon("★", "focus") }).addTo(g);
      if (pos) L.polyline([[pos.lat, pos.lng], [focus.lat, focus.lng]], { color: "#f3b81c", weight: 4, dashArray: "6 6" }).addTo(g);
    }
    // Só reposiciona o mapa quando muda o destino ou o roteiro (não a cada minuto nem a cada passo do GPS).
    const key = `${focus?.lat},${focus?.lng}|${stops.map((s) => s.id).join(",")}`;
    if (key !== viewKey.current) {
      viewKey.current = key;
      if (focus) m.setView([focus.lat, focus.lng], 16);
      else m.fitBounds(L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number])).pad(0.15));
    }
  }

  const d = focus && pos ? km(pos, focus) : null;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div ref={el} className="leaflet-box" role="region" aria-label={t.map} />
      {focus && (
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          <b>★ {focus.name}</b>
          {d !== null && <p>{fmt(t.mapDist, { d: d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`, w: walkMin(d) })}</p>}
          <div className="acts">
            <ExtLink href={osmWalk(pos, focus)}>🚶 {t.mapWalk}</ExtLink>
            {!focus.walk && <ExtLink href={transitLink(focus)}>🚇 {t.mapTransit}</ExtLink>}
          </div>
        </div>
      )}
      <div className="legend"><span>━ {t.route}</span><span>🏛 {t.museums}</span><span>✈ {t.airport}</span></div>
    </div>
  );
}

function esc(s: string) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)); }
