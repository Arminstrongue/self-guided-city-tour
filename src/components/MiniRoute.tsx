"use client";
/** Mapa pequeno dentro da app: de onde está até ao destino (sem sair para outra app). Percurso a pé desenhado se houver. */
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap } from "leaflet";
import { tilesAttr, tilesUrl } from "@/lib/map-config";

type P = { lat: number; lng: number; label?: string };

export function MiniRoute({ from, to, path }: { from: P; to: P; path?: [number, number][] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  useEffect(() => {
    let off = false;
    void import("leaflet").then((L) => {
      if (off || !el.current) return;
      map.current?.remove();
      const m = L.map(el.current, { zoomControl: false, attributionControl: true, dragging: true, scrollWheelZoom: false });
      L.tileLayer(tilesUrl(), { maxZoom: 19, attribution: tilesAttr() }).addTo(m);
      const dot = (cls: string, txt: string) => L.divIcon({ html: txt, className: `mk ${cls}`, iconSize: [26, 26], iconAnchor: [13, 13] });
      const line = path && path.length > 1 ? path : [[from.lat, from.lng], [to.lat, to.lng]] as [number, number][];
      L.polyline(line, { color: "#2997ff", weight: 5, opacity: 0.9, dashArray: path && path.length > 1 ? undefined : "8 8" }).addTo(m);
      L.marker([from.lat, from.lng], { icon: dot("stop", "●") }).addTo(m);
      L.marker([to.lat, to.lng], { icon: dot("done", "★") }).addTo(m);
      m.fitBounds(L.latLngBounds(line).pad(0.25), { maxZoom: 16 });
      map.current = m;
    });
    return () => { off = true; map.current?.remove(); map.current = null; };
  }, [from.lat, from.lng, to.lat, to.lng, path]);
  return <div ref={el} className="mini-route" role="img" aria-label={`${from.label ?? ""} → ${to.label ?? ""}`} />;
}
