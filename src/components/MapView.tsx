"use client";
/** Mapa OpenStreetMap (Leaflet) dentro da app: roteiro, museus, aeroporto e a posição do viajante. */
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import type { Airport, Stop } from "@/data/cities";
import type { Museum } from "@/data/museums";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { km, walkMin } from "@/lib/route-cost";
import { ExtLink } from "./ExtLink";
import { loadGoogle, type G } from "@/lib/gmaps-client";

import { tilesAttr, tilesUrl } from "@/lib/map-config";

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

export type Extra = { lat: number; lng: number; icon: string; title: string };
type MapProps = { stops: Stop[]; done: Record<string, boolean>; museums: Museum[]; airport?: Airport; pos: Pos | null; focus: Focus | null; t: Dict; gmapsKey?: string;
  extra?: Extra[]; center?: Pos; legend?: boolean; boxClass?: string; card?: boolean };

/** Google Maps quando há chave de navegador; senão o mapa OpenStreetMap. */
export function MapView(p: MapProps) {
  const [failed, setFailed] = useState(false);
  return p.gmapsKey && !failed ? <GoogleRouteMap {...p} onFail={() => setFailed(true)} /> : <OsmMap {...p} />;
}

function GoogleRouteMap({ stops, done, museums, airport, pos, focus, t, gmapsKey, onFail, extra = [], center, legend = true, boxClass = "", card = true }: MapProps & { onFail: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<G>(null);
  const objs = useRef<G[]>([]);
  const viewKey = useRef("");
  useEffect(() => {
    let off = false;
    loadGoogle(gmapsKey!).then((g) => {
      if (off || !el.current) return;
      const c = stops[0] ?? center ?? extra[0] ?? { lat: 0, lng: 0 };
      map.current = new g.maps.Map(el.current, { center: { lat: c.lat, lng: c.lng }, zoom: 14, mapTypeControl: false, streetViewControl: true, fullscreenControl: true, gestureHandling: "greedy", clickableIcons: true });
      draw(g);
    }).catch(onFail);
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Só redesenha quando o que se vê muda (não a cada renderização, p. ex. o relógio de 60 s).
  const sig = JSON.stringify([stops.map((s) => [s.id, s.lat, s.lng]), done, museums.length, extra.map((x) => [x.lat, x.lng, x.icon]), airport?.name, pos && [pos.lat.toFixed(5), pos.lng.toFixed(5)], focus && [focus.lat, focus.lng]]);
  useEffect(() => { const g = (window as unknown as { google?: G }).google; if (g?.maps && map.current) draw(g); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  function draw(g: G) {
    objs.current.forEach((o) => o.setMap(null)); objs.current = [];
    const m = map.current, info = new g.maps.InfoWindow();
    const add = (o: G) => { objs.current.push(o); return o; };
    const pin = (fill: string, stroke = "#fff", scale = 15) => ({ path: g.maps.SymbolPath.CIRCLE, scale, fillColor: fill, fillOpacity: 1, strokeColor: stroke, strokeWeight: 3 });
    add(new g.maps.Polyline({ map: m, path: stops.map((s) => ({ lat: s.lat, lng: s.lng })), strokeColor: "#0071e3", strokeOpacity: 0.85, strokeWeight: 5,
      icons: [{ icon: { path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.6, strokeColor: "#0071e3", fillColor: "#0071e3", fillOpacity: 1 }, offset: "50%", repeat: "120px" }] }));
    stops.forEach((s, i) => {
      const mk = add(new g.maps.Marker({ map: m, position: { lat: s.lat, lng: s.lng }, title: s.n, zIndex: 10 + i,
        label: { text: done[s.id] ? "✓" : String(i + 1), color: "#fff", fontWeight: "700", fontSize: "13px" }, icon: pin(done[s.id] ? "#30d158" : "#0071e3") }));
      mk.addListener("click", () => { info.setContent(`<b>${esc(s.n)}</b><br>${esc(s.a)}`); info.open({ map: m, anchor: mk }); });
    });
    extra.forEach((x) => { const mk = add(new g.maps.Marker({ map: m, position: { lat: x.lat, lng: x.lng }, title: x.title, label: { text: x.icon, fontSize: "15px" }, icon: pin("#ffffff", "#5e5ce6", 14) })); mk.addListener("click", () => { info.setContent(`<b>${esc(x.title)}</b>`); info.open({ map: m, anchor: mk }); }); });
    museums.forEach((x) => { const mk = add(new g.maps.Marker({ map: m, position: { lat: x.lat, lng: x.lng }, title: x.n, label: { text: "🏛", fontSize: "14px" }, icon: pin("#ffffff", "#b25000", 13) })); mk.addListener("click", () => { info.setContent(`<b>${esc(x.n)}</b>`); info.open({ map: m, anchor: mk }); }); });
    if (airport) add(new g.maps.Marker({ map: m, position: { lat: airport.lat, lng: airport.lng }, title: airport.name, label: { text: "✈", fontSize: "15px" }, icon: pin("#ffffff", "#1d1d1f", 14) }));
    if (pos) add(new g.maps.Marker({ map: m, position: pos, zIndex: 99, icon: pin("#2b7cff", "#fff", 8) }));
    if (focus) {
      add(new g.maps.Marker({ map: m, position: { lat: focus.lat, lng: focus.lng }, zIndex: 98, label: { text: "★", color: "#fff", fontSize: "14px" }, icon: pin("#ff9f0a") }));
      if (pos) add(new g.maps.Polyline({ map: m, path: [pos, { lat: focus.lat, lng: focus.lng }], strokeOpacity: 0, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: "#ff9f0a", scale: 3 }, offset: "0", repeat: "14px" }] }));
    }
    const key = `${focus?.lat},${focus?.lng}|${stops.map((s) => s.id).join(",")}|${extra.length}`;
    if (key !== viewKey.current) {
      viewKey.current = key;
      if (focus) { m.setCenter({ lat: focus.lat, lng: focus.lng }); m.setZoom(16); }
      else { const b = new g.maps.LatLngBounds(); [...stops, ...extra].forEach((s) => b.extend({ lat: s.lat, lng: s.lng })); if (!b.isEmpty()) m.fitBounds(b, 36); }
    }
  }
  const d = focus && pos ? km(pos, focus) : null;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div ref={el} className={`leaflet-box g-route-map ${boxClass}`} role="region" aria-label={t.map} />
      {focus && card && (
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          <b>★ {focus.name}</b>
          {d !== null && <p>{fmt(t.mapDist, { d: d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`, w: walkMin(d) })}</p>}
          <div className="acts">
            <ExtLink href={`https://www.google.com/maps/dir/?api=1&destination=${focus.lat},${focus.lng}&travelmode=walking`}>🚶 {t.mapWalk}</ExtLink>
            {!focus.walk && <ExtLink href={transitLink(focus)}>🚇 {t.mapTransit}</ExtLink>}
          </div>
        </div>
      )}
      {legend && <div className="legend"><span>━ {t.route}</span><span>🏛 {t.museums}</span><span>✈ {t.airport}</span><span>👤 Street View</span></div>}
    </div>
  );
}

function OsmMap({ stops, done, museums, airport, pos, focus, t, extra = [], center, legend = true, boxClass = "", card = true }: MapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const viewKey = useRef("");

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { zoomControl: true, attributionControl: true });
      L.tileLayer(tilesUrl(), { maxZoom: 19, attribution: tilesAttr() }).addTo(m);
      layer.current = L.layerGroup().addTo(m);
      map.current = m;
      draw(L);
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Só redesenha quando o que se vê muda (não a cada renderização, p. ex. o relógio de 60 s).
  const sig = JSON.stringify([stops.map((s) => [s.id, s.lat, s.lng]), done, museums.length, extra.map((x) => [x.lat, x.lng, x.icon]), airport?.name, pos && [pos.lat.toFixed(5), pos.lng.toFixed(5)], focus && [focus.lat, focus.lng]]);
  useEffect(() => { void import("leaflet").then((L) => draw(L)); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  function draw(L: typeof import("leaflet")) {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const icon = (html: string, cls: string) => L.divIcon({ html, className: `mk ${cls}`, iconSize: [28, 28], iconAnchor: [14, 14] });
    L.polyline(stops.map((s) => [s.lat, s.lng] as [number, number]), { color: "#2997ff", weight: 5, opacity: 0.9 }).addTo(g);
    stops.forEach((s, i) => L.marker([s.lat, s.lng], { icon: icon(done[s.id] ? "✓" : String(i + 1), done[s.id] ? "done" : "stop") }).bindPopup(`<b>${esc(s.n)}</b><br>${esc(s.a)}`).addTo(g));
    museums.forEach((x) => L.marker([x.lat, x.lng], { icon: icon("🏛", "mus") }).bindPopup(`<b>${esc(x.n)}</b>`).addTo(g));
    extra.forEach((x) => L.marker([x.lat, x.lng], { icon: icon(x.icon, "mus") }).bindPopup(`<b>${esc(x.title)}</b>`).addTo(g));
    if (airport) L.marker([airport.lat, airport.lng], { icon: icon("✈", "air") }).bindPopup(`<b>${esc(airport.name)}</b>`).addTo(g);
    if (pos) L.circleMarker([pos.lat, pos.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2b7cff", fillOpacity: 1 }).addTo(g);
    if (focus) {
      L.marker([focus.lat, focus.lng], { icon: icon("★", "focus") }).addTo(g);
      if (pos) L.polyline([[pos.lat, pos.lng], [focus.lat, focus.lng]], { color: "#ff9f0a", weight: 4, dashArray: "6 6" }).addTo(g);
    }
    // Só reposiciona o mapa quando muda o destino ou o roteiro (não a cada minuto nem a cada passo do GPS).
    const key = `${focus?.lat},${focus?.lng}|${stops.map((s) => s.id).join(",")}|${extra.length}`;
    if (key !== viewKey.current) {
      viewKey.current = key;
      const pts = [...stops, ...extra].map((s) => [s.lat, s.lng] as [number, number]);
      if (focus) m.setView([focus.lat, focus.lng], 16);
      else if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.15));
      else if (center) m.setView([center.lat, center.lng], 13);
    }
  }

  const d = focus && pos ? km(pos, focus) : null;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div ref={el} className={`leaflet-box ${boxClass}`} role="region" aria-label={t.map} />
      {focus && card && (
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          <b>★ {focus.name}</b>
          {d !== null && <p>{fmt(t.mapDist, { d: d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`, w: walkMin(d) })}</p>}
          <div className="acts">
            <ExtLink href={osmWalk(pos, focus)}>🚶 {t.mapWalk}</ExtLink>
            {!focus.walk && <ExtLink href={transitLink(focus)}>🚇 {t.mapTransit}</ExtLink>}
          </div>
        </div>
      )}
      {legend && <div className="legend"><span>━ {t.route}</span><span>🏛 {t.museums}</span><span>✈ {t.airport}</span></div>}
    </div>
  );
}

function esc(s: string) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)); }
