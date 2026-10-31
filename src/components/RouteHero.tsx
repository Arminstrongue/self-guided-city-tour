"use client";
/**
 * Topo do roteiro: o melhor percurso pelas atrações principais, num relance.
 * Mapa com os pinos numerados e a sua posição, resumo (paragens, tempo, transportes) e as paragens em fila:
 * tocar numa paragem centra o mapa nela e abre os detalhes.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import type { Airport, Stop } from "@/data/cities";
import type { Museum } from "@/data/museums";
import type { Focus } from "./MapView";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false, loading: () => <div className="leaflet-box rh-box rh-skel" aria-hidden="true" /> });
type Pos = { lat: number; lng: number };

export function RouteHero({ t, stops, done, pos, gmapsKey, online, hours, transport, onOpen, onFullMap }: {
  t: Dict; stops: Stop[]; done: Record<string, boolean>; museums: Museum[]; airport?: Airport; pos: Pos | null; gmapsKey?: string; online: boolean;
  hours: string; transport: string; onOpen: (id: string) => void; onFullMap: () => void;
}) {
  const [focus, setFocus] = useState<Focus | null>(null);
  const nextIdx = stops.findIndex((s) => !done[s.id]);
  const tops = stops.filter((s) => s.top).length;
  return (
    <section className="rh card" aria-label={t.rh.title}>
      <div className="rh-head">
        <div>
          <b className="rh-t">⭐ {t.rh.title}</b>
          <span className="rh-s">{fmt(t.rh.sub, { n: stops.length, h: hours })}{tops ? ` · ${fmt(t.rh.tops, { n: tops })}` : ""}{transport ? ` · ${transport}` : ""}</span>
        </div>
        {online && <button type="button" className="link-btn" onClick={onFullMap}>{t.rh.full} ↗</button>}
      </div>
      {online && <MapView stops={stops} done={done} museums={[]} pos={pos} focus={focus} t={t} gmapsKey={gmapsKey} legend={false} card={false} boxClass="rh-box" />}
      <ol className="rh-chips" aria-label={t.rh.stops}>
        {stops.map((s, i) => (
          <li key={s.id}>
            <button type="button" className={`rh-chip press${done[s.id] ? " done" : i === nextIdx ? " next" : ""}`}
              onClick={() => { if (focus?.name === s.n || !online) onOpen(s.id); else setFocus({ lat: s.lat, lng: s.lng, name: s.n, walk: true }); }} aria-pressed={focus?.name === s.n}>
              <span className="rh-n num" aria-hidden="true">{done[s.id] ? "✓" : i + 1}</span>
              <span className="rh-nm">{s.n}</span>
              {s.top && <span className="rh-star" aria-label={t.topStop}>★</span>}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
