"use client";
/**
 * Navegação dentro da VOYBU até à próxima paragem: mapa com a sua posição e o destino, passos (a pé / linha, sentido,
 * paragem de entrada e saída, n.º de paragens), o passo atual em destaque conforme avança, distância e tempo que faltam,
 * e o momento "chegou" (marca a paragem e mostra a seguinte). O Google/Apple Maps fica como alternativa.
 * Os passos vêm da Google (Routes) e só aparecem como texto (com a atribuição); no mapa não-Google não se desenha o percurso deles.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import type { Stop, Leg } from "@/data/cities";
import type { Museum } from "@/data/museums";
import type { GuideStep } from "@/lib/route-steps";
import { lineText, localName } from "@/data/stop-names";
import Portal from "./Portal";
import { ExtLink } from "./ExtLink";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false });
type Pos = { lat: number; lng: number };
const ARRIVE_M = 60;

const dist = (a: Pos, b: Pos) => {
  const x = ((b.lng - a.lng) * Math.PI / 180) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = (b.lat - a.lat) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371000;
};
const bearing = (a: Pos, b: Pos) => {
  const f1 = a.lat * Math.PI / 180, f2 = b.lat * Math.PI / 180, dl = (b.lng - a.lng) * Math.PI / 180;
  const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};
const fmtD = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const VEH: Record<string, string> = { bus: "🚌", tram: "🚊", light_rail: "🚊", subway: "🚇", metro_rail: "🚇", heavy_rail: "🚆", rail: "🚆", commuter_train: "🚆", high_speed_train: "🚄", ferry: "⛴", cable_car: "🚡", funicular: "🚞" };

export function NavSheet({ t, locale, stop, leg, next, from, stops, done, museums, gmapsKey, onArrive, onClose }: {
  t: Dict; locale: Locale; stop: Stop; leg: Leg; next: Stop | null; from: Pos | null; stops: Stop[]; done: Record<string, boolean>; museums: Museum[];
  gmapsKey?: string; onArrive: (id: string) => void; onClose: () => void;
}) {
  const n = t.nav;
  const [pos, setPos] = useState<Pos | null>(from);
  const [geo, setGeo] = useState<"wait" | "on" | "off">(from ? "on" : "wait");
  const [steps, setSteps] = useState<GuideStep[] | null>(null);
  const [fare, setFare] = useState("");
  const [arrived, setArrived] = useState(false);
  const [help, setHelp] = useState(false);
  const startD = useRef<number | null>(null);
  const dest = useMemo(() => ({ lat: stop.lat, lng: stop.lng }), [stop.lat, stop.lng]);

  // Posição contínua + ecrã ligado enquanto navega.
  useEffect(() => {
    let wid: number | null = null;
    if ("geolocation" in navigator) wid = navigator.geolocation.watchPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeo("on"); }, () => setGeo("off"), { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    else setGeo("off");
    // Ecrã ligado: pede de novo ao voltar à app; se fechar antes de a resposta chegar, liberta logo.
    type WL = { release: () => Promise<void> };
    let lock: WL | null = null, off = false;
    const wl = (navigator as unknown as { wakeLock?: { request: (k: "screen") => Promise<WL> } }).wakeLock;
    const get = () => { if (!wl || document.visibilityState !== "visible") return; void wl.request("screen").then((l) => { if (off) void l.release().catch(() => null); else lock = l; }).catch(() => null); };
    const vis = () => { if (document.visibilityState === "visible") get(); };
    get(); document.addEventListener("visibilitychange", vis);
    return () => { off = true; document.removeEventListener("visibilitychange", vis); if (wid !== null) navigator.geolocation.clearWatch(wid); void lock?.release().catch(() => null); };
  }, []);

  // Passos (uma vez por destino, com a primeira posição conhecida; a pé quando é perto).
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    const a = pos ?? from;
    if (!a && geo === "wait") return;
    asked.current = true;
    if (!a) { setSteps([]); return; }
    const walk = leg.m === "walk" || dist(a, dest) < 1200 ? "&mode=walk" : "";
    fetch(`/api/route-steps?from=${a.lat},${a.lng}&to=${dest.lat},${dest.lng}&lang=${locale}${walk}`).then((r) => (r.ok ? r.json() : null))
      .then((j: { steps?: GuideStep[]; fare?: string } | null) => { setSteps(j?.steps ?? []); setFare(j?.fare ?? ""); }).catch(() => setSteps([]));
  }, [pos, from, geo, dest, leg.m, locale]);

  const d = pos ? dist(pos, dest) : null;
  if (d !== null && startD.current === null) startD.current = d;
  useEffect(() => {
    if (d !== null && d < ARRIVE_M && !arrived) { setArrived(true); try { navigator.vibrate?.([120, 60, 120]); } catch { /* ignorar */ } }
  }, [d, arrived]);

  // Passo atual: pela parte do caminho já feita (distância ao destino face à inicial), distribuída pelos passos.
  const cur = useMemo(() => {
    if (!steps?.length || d === null || !startD.current) return 0;
    const doneFrac = Math.max(0, Math.min(1, 1 - d / startD.current));
    const w = steps.map((s) => (s.k === "walk" ? s.m : s.min * 300)); // peso: metros a pé; transportes ~300 m/min
    const tot = w.reduce((x, y) => x + y, 0) || 1;
    let acc = 0;
    for (let i = 0; i < w.length; i++) { acc += w[i]; if (acc / tot >= doneFrac + 0.001) return i; }
    return w.length - 1;
  }, [steps, d]);

  const leftMin = d === null ? leg.min : leg.m === "walk" || (steps && steps.every((s) => s.k === "walk")) ? Math.max(1, Math.round((d * 1.25) / 80)) : Math.max(1, Math.round(leg.min * (d / (startD.current || d || 1))));
  const dirs = [n.dN, n.dNE, n.dE, n.dSE, n.dS, n.dSW, n.dW, n.dNW];
  const head = pos ? bearing(pos, dest) : null;
  const headTxt = head === null ? "" : dirs[Math.round(head / 45) % 8];
  const gm = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=${leg.m === "walk" ? "walking" : "transit"}`;
  const am = `https://maps.apple.com/?daddr=${dest.lat},${dest.lng}&dirflg=${leg.m === "walk" ? "w" : "r"}`;

  return (
    <Portal>
      <div className="nav" role="dialog" aria-label={fmt(n.to, { s: stop.n })}>
        <header className="nav-h">
          <div style={{ minWidth: 0 }}>
            <span className="nav-k">🧭 {n.title}</span>
            <b className="nav-t">{stop.n}</b>
            <span className="nav-s num">{d === null ? (geo === "off" ? n.noGps : n.locating) : arrived ? n.here : fmt(n.left, { d: fmtD(d), m: leftMin })}</span>
          </div>
          <button type="button" className="nav-x" onClick={onClose} aria-label={t.close}>✕</button>
        </header>

        <div className="nav-map">
          <MapView stops={stops} done={done} museums={museums} pos={pos} focus={{ lat: dest.lat, lng: dest.lng, name: stop.n, walk: leg.m === "walk" }} t={t} gmapsKey={gmapsKey} legend={false} card={false} boxClass="nav-box" />
          {head !== null && !arrived && (
            <div className="nav-arrow" aria-label={fmt(n.head, { d: headTxt })}>
              <span style={{ transform: `rotate(${head}deg)` }} aria-hidden="true">➤</span>
              <small>{fmt(n.head, { d: headTxt })}</small>
            </div>
          )}
        </div>

        {arrived ? (
          <section className="nav-done" role="status">
            <b>🎉 {fmt(n.arrived, { s: stop.n })}</b>
            <div className="nav-acts">
              <button type="button" className="btn press nav-go" onClick={() => { onArrive(stop.id); onClose(); }}>{t.nxHere}</button>
            </div>
            {next && <p className="hint">{fmt(n.next, { s: next.n })}</p>}
          </section>
        ) : (
          <section className="nav-steps">
            {/* Resumo do troço planeado (dados da VOYBU) sempre visível, mesmo sem passos da Google. */}
            <div className="nav-plan">
              <span className="nav-ic" aria-hidden="true">{leg.m === "walk" ? "🚶" : leg.m === "car" ? "🚕" : leg.m === "tram" ? "🚊" : leg.m === "bus" ? "🚌" : leg.m === "train" ? "🚆" : leg.m === "ferry" ? "⛴" : "🚇"}</span>
              <span><b>{leg.m === "walk" ? fmt(n.walkMin, { m: leg.min }) : `${t[leg.m]} · ${leg.min} min`}</b>{leg.line && <small>{lineText(leg.line, locale)}</small>}{fare && <small>💷 {fare}</small>}</span>
            </div>
            {steps === null ? <p className="hint">{n.loading}</p> : steps.length === 0 ? <p className="hint">{n.noSteps}</p> : (
              <ol className="nav-list">
                {steps.map((s, i) => (
                  <li key={i} className={i === cur ? "now" : i < cur ? "past" : ""} aria-current={i === cur ? "step" : undefined}>
                    {s.k === "walk" ? (
                      <><span className="nav-ic" aria-hidden="true">🚶</span><span><b>{s.text || fmt(n.walkM, { d: fmtD(s.m) })}</b><small className="num">{fmtD(s.m)} · {s.min} min</small></span></>
                    ) : (
                      <><span className="nav-ic" aria-hidden="true">{VEH[s.vehicle] ?? "🚌"}</span>
                        <span>
                          <b><span className="nav-line" style={s.color ? { background: s.color, color: "#fff" } : undefined}>{s.line}</span> {s.headsign && fmt(n.towards, { h: s.headsign })}</b>
                          <small>{fmt(n.board, { a: s.from })}{s.dep ? ` · ${fmt(n.dep, { t: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(s.dep)) })}` : ""}</small>
                          <small>{fmt(n.getOff, { b: s.to, n: s.stops })} · {s.min} min</small>
                        </span></>
                    )}
                    {i === cur && <em className="nav-now">{n.now}</em>}
                  </li>
                ))}
              </ol>
            )}
            {steps && steps.length > 0 && <small className="nav-attr">{n.google}</small>}
          </section>
        )}

        {/* Ecrã para mostrar a um funcionário ou a quem passa: o destino em letra grande (e no alfabeto local). */}
        {help && (
          <div className="nav-help" role="dialog" aria-modal="true" aria-label={n.help} tabIndex={-1} ref={(el) => el?.focus()} onClick={() => setHelp(false)} onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Enter") setHelp(false); }}>
            <p className="nav-help-q">{n.helpAsk}</p>
            <p className="nav-help-q en" lang="en">Excuse me, how do I get here?</p>
            <b className="nav-help-n">{stop.n}</b>
            {(() => { const ln = localName(stop.id); return ln ? <b className="nav-help-n" lang={ln.lang}>{ln.n}</b> : null; })()}
            <span className="nav-help-a">{stop.a}</span>
            <small>{n.helpClose}</small>
          </div>
        )}
        <button type="button" className="btn ghost press nav-helpbtn" onClick={() => setHelp(true)}>🙋 {n.help}</button>
        <div className="nav-foot">
          <ExtLink className="link-btn" href={gm}>{n.gmaps}</ExtLink>
          <ExtLink className="link-btn" href={am}>{n.amaps}</ExtLink>
        </div>
      </div>
    </Portal>
  );
}
