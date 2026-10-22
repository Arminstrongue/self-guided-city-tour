"use client";
import type { Stop } from "@/data/cities";
import type { Dict } from "@/i18n/dictionaries";
import type { Base } from "@/lib/route-cost";
import { km } from "@/lib/route-cost";

type LL = { lat: number; lng: number };

/**
 * Mapa simplificado do percurso, desenhado no próprio telemóvel: funciona sem internet e sem mosaicos.
 * Paragens numeradas pela ordem, ponto de partida, a sua posição (GPS funciona sem dados), norte e escala.
 */
export function RouteSketch({ stops, done, base, pos, t }: { stops: Stop[]; done: Record<string, boolean>; base: Base; pos: LL | null; t: Dict }) {
  const pts: LL[] = [...stops, ...(base.kind === "place" ? [base] : [])];
  const near = pos && stops.length && km(pos, stops[0]) < 30 ? pos : null; // fora da cidade não ajuda
  if (near) pts.push(near);
  if (!pts.length) return null;
  const lat0 = pts.reduce((a, p) => a + p.lat, 0) / pts.length;
  const kx = Math.cos((lat0 * Math.PI) / 180);
  const xs = pts.map((p) => p.lng * kx), ys = pts.map((p) => -p.lat);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const W = 340, H = 300, pad = 26;
  const s = Math.min((W - pad * 2) / Math.max(maxX - minX, 0.002), (H - pad * 2) / Math.max(maxY - minY, 0.002));
  const ox = (W - (maxX - minX) * s) / 2, oy = (H - (maxY - minY) * s) / 2;
  const P = (p: LL) => ({ x: ox + (p.lng * kx - minX) * s, y: oy + (-p.lat - minY) * s });
  // Escala: quantos metros cabem em 60 px (1° de latitude ≈ 111 km).
  const m60 = Math.round(((60 / s) * 111_000) / 50) * 50 || 50;
  const line = stops.map((p) => { const q = P(p); return `${q.x.toFixed(1)},${q.y.toFixed(1)}`; }).join(" ");
  const b = base.kind === "place" ? P(base) : null, me = near ? P(near) : null;
  return (
    <figure className="sk card">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.skTitle}>
        <rect width={W} height={H} rx="14" className="sk-bg" />
        {b && stops[0] && <line x1={b.x} y1={b.y} x2={P(stops[0]).x} y2={P(stops[0]).y} className="sk-hop" />}
        {b && stops.length > 0 && <line x1={P(stops[stops.length - 1]).x} y1={P(stops[stops.length - 1]).y} x2={b.x} y2={b.y} className="sk-hop" />}
        <polyline points={line} className="sk-line" />
        {b && <g transform={`translate(${b.x},${b.y})`}><rect x="-9" y="-9" width="18" height="18" rx="5" className="sk-base" /><text y="4" textAnchor="middle" fontSize="11">{base.kind === "place" && base.here ? "📍" : "🏨"}</text></g>}
        {stops.map((p, i) => { const q = P(p); return (
          <g key={p.id} transform={`translate(${q.x},${q.y})`} className={done[p.id] ? "sk-done" : "sk-stop"}>
            <circle r="11" /><text y="4" textAnchor="middle">{done[p.id] ? "✓" : i + 1}</text>
          </g>
        ); })}
        {me && <g transform={`translate(${me.x},${me.y})`}><circle r="12" className="sk-me-halo" /><circle r="6" className="sk-me" /></g>}
        <g transform={`translate(${W - 22},24)`} className="sk-n"><path d="M0,-10 L6,6 L0,2 L-6,6 Z" /><text y="18" textAnchor="middle">N</text></g>
        <g transform={`translate(14,${H - 16})`} className="sk-scale"><line x1="0" y1="0" x2="60" y2="0" /><text x="30" y="-5" textAnchor="middle">{m60 >= 1000 ? `${(m60 / 1000).toFixed(1)} km` : `${m60} m`}</text></g>
      </svg>
      <figcaption className="hint">{t.skNote}</figcaption>
    </figure>
  );
}
