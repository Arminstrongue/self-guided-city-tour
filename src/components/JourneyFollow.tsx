"use client";
/**
 * Seguir a viagem (comboio/autocarro com troços): como o "Start" do Google Maps, mas dentro da VOYBU.
 * - Paragem a paragem, pela localização (GPS) ou, sem ela, pelo horário.
 * - "Saia na próxima" e "Mudança em …" em grande, com vibração e notificação.
 * - Mantém o ecrã ligado (Wake Lock) enquanto segue; com o ecrã desligado, a app instalada avisa por notificações
 *   agendadas no sistema (tocam mesmo com o telemóvel a dormir). Ao voltar à app, retoma onde estava.
 * As plataformas e horários podem mudar: confirmar sempre nos painéis ou com os funcionários da estação.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import type { Reservation } from "@/lib/trip-local";
import { legDates } from "@/lib/journey-time";
import { callsBetween, coordsOf, type Call } from "@/data/rail-lines";

import { notifId } from "@/lib/trip-export";
import { ALL_MODES, saveTransit, useTransitPrefs, type RouteOpt } from "@/lib/transit-prefs";
import Portal from "./Portal";

type Pos = { lat: number; lng: number };
type Stop = { n: string; lat: number | null; lng: number | null };
const KEY = "sgct:jf";
const GET_OFF_MIN = 4;   // avisar "saia na próxima" a estes minutos da chegada
const NEAR_M = 1800;     // …ou a esta distância da estação de chegada

const dist = (a: Pos, b: Pos) => {
  const x = ((b.lng - a.lng) * Math.PI / 180) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = (b.lat - a.lat) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371000;
};
const isNative = () => Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
const hm = (d: Date, tz: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(d);
const minsTo = (d: Date, now: number) => Math.max(0, Math.round((d.getTime() - now) / 60_000));

/** Viagem em curso guardada neste telemóvel (para retomar depois de o ecrã apagar ou a app fechar). */
export function activeJourney(): string | null {
  try { const j = JSON.parse(localStorage.getItem(KEY) ?? "null") as { id: string; until: number } | null; return j && j.until > Date.now() ? j.id : null; } catch { return null; }
}

/** Paragens de cada troço: intermédias quando a linha é conhecida, senão só partida e chegada. */
function stopsOf(r: Reservation): Stop[][] {
  return (r.journey?.legs ?? []).map((l) => {
    const c: Call[] | null = callsBetween(l.from, l.to, l.op);
    if (c) return c.map((x) => ({ n: x.n, lat: x.lat, lng: x.lng }));
    return [l.from, l.to].map((n) => { const p = coordsOf(n); return { n, lat: p?.lat ?? null, lng: p?.lng ?? null }; });
  });
}

/** Notificação "fixa" com o progresso (substitui a anterior: mesmo id/etiqueta). */
async function progressNote(title: string, body: string, id: number) {
  try {
    if (isNative()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      await LocalNotifications.schedule({ notifications: [{ id, title, body, ongoing: true, autoCancel: false, silent: true } as never] });
    } else if ("Notification" in window && Notification.permission === "granted") {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.showNotification(title, { body, tag: "voybu-journey", silent: true, icon: "/icon-192.png" } as NotificationOptions);
    }
  } catch { /* ignorar */ }
}
async function alertNote(title: string, body: string, id: number) {
  try {
    if (isNative()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      await LocalNotifications.schedule({ notifications: [{ id, title, body }] });
    } else if ("Notification" in window && Notification.permission === "granted") {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.showNotification(title, { body, tag: `voybu-alert-${id}`, icon: "/icon-192.png" } as NotificationOptions);
    }
  } catch { /* ignorar */ }
}

export function JourneyFollow({ r, t, onClose }: { r: Reservation; t: Dict; onClose: () => void }) {
  const j = t.jf;
  const legs = r.journey?.legs ?? [];
  // Atraso indicado pelo viajante (sem dados em tempo real): desloca todas as horas e os avisos.
  const [manual, setDelay] = useState<number>(() => { try { const x = JSON.parse(localStorage.getItem(KEY) ?? "null") as { id: string; delay?: number } | null; return x?.id === r.id ? x.delay ?? 0 : 0; } catch { return 0; } });
  const base = useMemo(() => legDates(r), [r]);
  // Atraso medido pela localização (onde está vs. onde o horário diz que devia estar). O botão manual tem prioridade.
  const [auto, setAuto] = useState(0);
  const delay = manual > 0 ? manual : auto;
  const ld = useMemo(() => base.map((d) => ({ dep: new Date(d.dep.getTime() + delay * 60_000), arr: new Date(d.arr.getTime() + delay * 60_000) })), [base, delay]);
  const stops = useMemo(() => stopsOf(r), [r]);
  const prefs = useTransitPrefs();
  const [now, setNow] = useState(() => Date.now());
  const [pos, setPos] = useState<Pos | null>(null);
  const [gps, setGps] = useState<"wait" | "on" | "off">("wait");
  const [keepOn, setKeepOn] = useState(true);
  const [lockOk, setLockOk] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const passed = useRef<number[]>(legs.map(() => 0));   // maior índice de paragem já passada, por troço (nunca recua)
  const alerted = useRef<Set<string>>(new Set());
  const noteId = notifId(`${r.id}:jf`);
  const tz = r.tz;

  // Guardar "em curso" (retomar ao reabrir) e agendar avisos no sistema (tocam com o ecrã desligado, na app instalada).
  useEffect(() => {
    const until = (ld[ld.length - 1]?.arr.getTime() ?? Date.now()) + 30 * 60_000;
    try { localStorage.setItem(KEY, JSON.stringify({ id: r.id, until, delay })); } catch { /* ignorar */ }
    void (async () => {
      if (isNative()) {
        try {
          const { LocalNotifications } = await import("@capacitor/local-notifications");
          const perm = await LocalNotifications.requestPermissions();
          if (perm.display !== "granted") return;
          await LocalNotifications.cancel({ notifications: legs.map((_, i) => ({ id: notifId(`${r.id}:jf-off${i}`) })) }).catch(() => null);
          const list = legs.flatMap((l, i) => {
            const nx = legs[i + 1];
            const at = new Date(ld[i].arr.getTime() - GET_OFF_MIN * 60_000);
            return at.getTime() > Date.now() + 30_000 ? [{ id: notifId(`${r.id}:jf-off${i}`), title: `🚉 ${fmt(j.getOffNext, { s: l.to })}`,
              body: nx ? fmt(j.changeNext, { t: hm(ld[i + 1].dep, tz), p: nx.pf ? ` · ${t.pf.short} ${nx.pf}` : "", m: Math.max(0, Math.round((ld[i + 1].dep.getTime() - ld[i].arr.getTime()) / 60_000)) }) : j.pfCheck,
              schedule: { at, allowWhileIdle: true } }] : [];
          });
          if (list.length) await LocalNotifications.schedule({ notifications: list });
        } catch { /* ignorar */ }
      } else if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission().catch(() => null);
      }
    })();
  }, [r.id, delay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atraso automático: projeta a posição na linha (paragens com coordenadas) e compara com a hora prevista nesse ponto.
  useEffect(() => {
    if (!pos) return;
    const t0 = Date.now();
    let late: number | null = null;
    for (let i = 0; i < base.length && late === null; i++) {
      const st = stops[i], dep = base[i].dep.getTime(), arr = base[i].arr.getTime();
      if (t0 < dep - 10 * 60_000 || t0 > arr + 120 * 60_000 || st.some((x) => x.lat == null)) continue;
      const pts = st.map((x) => ({ lat: x.lat!, lng: x.lng! }));
      // Ainda na estação de partida depois da hora: o comboio não saiu.
      if (dist(pos, pts[0]) < 400) { if (t0 > dep + 2 * 60_000) late = Math.round((t0 - dep) / 60_000); else late = 0; break; }
      const kx = Math.cos(pos.lat * Math.PI / 180) * 111_320, ky = 110_540;
      const P = (q: Pos) => ({ x: q.lng * kx, y: q.lat * ky });
      const me = P(pos);
      let total = 0, bestD = Infinity, at = 0;
      const seg: number[] = [];
      for (let x = 0; x + 1 < pts.length; x++) {
        const a = P(pts[x]), b = P(pts[x + 1]), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
        const u = Math.max(0, Math.min(1, ((me.x - a.x) * dx + (me.y - a.y) * dy) / (L * L)));
        const d = Math.hypot(a.x + u * dx - me.x, a.y + u * dy - me.y);
        if (d < bestD) { bestD = d; at = total + u * L; }
        seg.push(L); total += L;
      }
      if (bestD > 3000 || total < 1) continue;          // longe desta linha: não é este troço
      const f = at / total;
      if (f < 0.03 || f > 0.97) continue;               // perto das pontas a estimativa engana (paragem, saída lenta)
      const expected = dep + f * (arr - dep);
      late = Math.round((t0 - expected) / 60_000);
    }
    if (late === null) return;
    const v = Math.max(0, Math.min(180, late));
    setAuto((cur) => (Math.abs(v - cur) >= 2 ? v : cur)); // só muda com diferença de 2+ min (evita saltos)
  }, [pos, base, stops, now]);

  // Relógio (10 s) e localização.
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 10_000);
    const wake = () => setNow(Date.now());
    document.addEventListener("visibilitychange", wake);
    let wid: number | null = null;
    if ("geolocation" in navigator) {
      wid = navigator.geolocation.watchPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGps("on"); }, () => setGps("off"), { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 });
    } else setGps("off");
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", wake); if (wid !== null) navigator.geolocation.clearWatch(wid); };
  }, []);

  // Ecrã ligado enquanto segue (volta a pedir quando a página regressa ao primeiro plano).
  useEffect(() => {
    if (!keepOn) return;
    type WL = { release: () => Promise<void> };
    let lock: WL | null = null, off = false;
    const get = async () => {
      try { const wl = (navigator as unknown as { wakeLock?: { request: (k: "screen") => Promise<WL> } }).wakeLock; if (!wl || document.visibilityState !== "visible") return; lock = await wl.request("screen"); if (off) void lock.release(); else setLockOk(true); } catch { setLockOk(false); }
    };
    const vis = () => { if (document.visibilityState === "visible") void get(); };
    void get(); document.addEventListener("visibilitychange", vis);
    return () => { off = true; document.removeEventListener("visibilitychange", vis); void lock?.release().catch(() => null); setLockOk(false); };
  }, [keepOn]);

  // Fase atual: antes de partir, a bordo do troço i, a mudar depois do troço i, ou chegou.
  const phase = useMemo(() => {
    if (!ld.length) return { k: "done" as const, i: 0 };
    if (now < ld[0].dep.getTime() - 60_000) return { k: "before" as const, i: 0 };
    for (let i = 0; i < ld.length; i++) {
      if (now < ld[i].arr.getTime() + 60_000) return { k: "ride" as const, i };
      if (ld[i + 1] && now < ld[i + 1].dep.getTime()) return { k: "change" as const, i };
    }
    // GPS ainda longe do destino? Comboio atrasado: continua a mostrar o último troço.
    const last = stops[stops.length - 1]?.at(-1);
    if (pos && last?.lat != null && last.lng != null && dist(pos, { lat: last.lat, lng: last.lng }) > NEAR_M && now < ld[ld.length - 1].arr.getTime() + 45 * 60_000) return { k: "ride" as const, i: ld.length - 1 };
    return { k: "done" as const, i: ld.length - 1 };
  }, [now, ld, pos, stops]);

  // Paragem seguinte no troço em curso: pelo GPS (a mais próxima, sem recuar) ou pelo horário.
  const ride = useMemo(() => {
    if (phase.k !== "ride") return null;
    const i = phase.i, st = stops[i], dep = ld[i].dep.getTime(), arr = ld[i].arr.getTime();
    let k = passed.current[i];
    const withC = st.every((s) => s.lat != null);
    if (pos && withC && st.length > 2) {
      let best = 0, bd = Infinity;
      st.forEach((s, x) => { const d = dist(pos, { lat: s.lat!, lng: s.lng! }); if (d < bd) { bd = d; best = x; } });
      // Passou a paragem mais próxima se já está mais perto da seguinte do que ela da anterior (aprox.): conta como passada quando a <400 m ou depois.
      const at = bd < 400 ? best : best - 1;
      k = Math.max(k, Math.min(at, st.length - 2));
      passed.current[i] = k; // só a posição real fica guardada (o horário é uma estimativa e não pode "empurrar" o GPS)
    } else {
      const f = Math.min(1, Math.max(0, (now - dep) / Math.max(60_000, arr - dep)));
      k = Math.max(k, Math.min(st.length - 2, Math.floor(f * (st.length - 1))));
    }
    const next = st[Math.min(k + 1, st.length - 1)];
    const left = st.length - 1 - k;
    const end = st[st.length - 1];
    const dEnd = pos && end.lat != null && end.lng != null ? dist(pos, { lat: end.lat, lng: end.lng }) : null;
    const min = minsTo(ld[i].arr, now);
    const getOff = left <= 1 && (min <= GET_OFF_MIN || (dEnd !== null && dEnd < NEAR_M));
    const tf = Math.min(1, Math.max(0, (now - dep) / Math.max(60_000, arr - dep)));
    const frac = st.length > 2 && pos && withC ? Math.max(k / (st.length - 1), Math.min(tf, (k + 1) / (st.length - 1))) : tf;
    return { i, k, next, left, min, getOff, frac, end };
  }, [phase, stops, ld, pos, now]);

  // Notificação de progresso + alerta (uma vez) quando é para sair ou mudar.
  const title = phase.k === "ride" && ride ? fmt(j.ride, { s: legs[ride.i].to }) : phase.k === "change" ? fmt(j.change, { s: legs[phase.i].to }) : phase.k === "before" ? fmt(j.board, { s: legs[0]?.from ?? "" }) : fmt(j.arrived, { s: legs[legs.length - 1]?.to ?? "" });
  const sub = phase.k === "ride" && ride ? fmt(ride.left === 1 ? j.stop1 : j.stopsMin, { n: ride.left, m: ride.min })
    : phase.k === "change" ? fmt(j.changeNext, { t: hm(ld[phase.i + 1].dep, tz), p: legs[phase.i + 1].pf ? ` · ${t.pf.short} ${legs[phase.i + 1].pf}` : "", m: minsTo(ld[phase.i + 1].dep, now) })
    : phase.k === "before" ? fmt(j.departsIn, { m: minsTo(ld[0].dep, now), t: ld[0] ? hm(ld[0].dep, tz) : "" }) : "";
  useEffect(() => { if (phase.k !== "done") void progressNote(`🚆 ${title}`, sub, noteId); }, [title, sub]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!ride?.getOff) return;
    const key = `off${ride.i}`;
    if (alerted.current.has(key)) return;
    alerted.current.add(key);
    try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch { /* ignorar */ }
    void alertNote(`🚉 ${fmt(j.getOffNext, { s: legs[ride.i].to })}`, legs[ride.i + 1] ? fmt(j.change, { s: legs[ride.i].to }) : j.pfCheck, notifId(`${r.id}:jf-now${ride.i}`));
  }, [ride?.getOff, ride?.i]); // eslint-disable-line react-hooks/exhaustive-deps

  const end = async () => {
    try { localStorage.removeItem(KEY); localStorage.removeItem("sgct:jf-adhoc"); } catch { /* ignorar */ }
    try {
      if (isNative()) {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        await LocalNotifications.cancel({ notifications: [noteId, ...legs.map((_, i) => notifId(`${r.id}:jf-off${i}`))].map((id) => ({ id })) });
      } else {
        const reg = await navigator.serviceWorker?.getRegistration();
        (await reg?.getNotifications({ tag: "voybu-journey" }))?.forEach((n) => n.close());
      }
    } catch { /* ignorar */ }
    onClose();
  };

  const legI = phase.k === "ride" ? phase.i : phase.k === "change" ? phase.i + 1 : phase.k === "before" ? 0 : legs.length - 1;
  const st = stops[legI] ?? [];
  const k = phase.k === "ride" && ride ? ride.k : phase.k === "done" || (phase.k === "change" && legI <= phase.i) ? st.length - 1 : -1;
  const l = legs[legI];
  const routeOpts: RouteOpt[] = ["best", "transfers", "walk", "wheel", "cost"];

  return (
    <Portal>
      <div className="jf" role="dialog" aria-label={j.title}>
        <header className="jf-h">
          <div>
            <b className="jf-t">{title}</b>
            {sub && <span className="jf-s num">{sub}</span>}
          </div>
          <button type="button" className="jf-x" onClick={onClose} aria-label={t.close}>⌄</button>
        </header>

        {ride?.getOff && <div className="jf-off" role="alert">🚉 {fmt(j.getOffNext, { s: legs[ride.i].to })}</div>}
        {phase.k === "change" && <div className="jf-chg" role="status">🔁 {fmt(j.change, { s: legs[phase.i].to })} · <span className="num">{sub}</span></div>}

        {(() => { const pc = Math.round((ride?.frac ?? (phase.k === "done" ? 1 : 0)) * 100); return <div className="jf-bar" aria-hidden="true" style={{ ["--p" as string]: `${pc}%` }}><i>➤</i></div>; })()}

        {l && (
          <section className="jf-leg">
            <div className="jf-legh"><span className="chip">{l.op || t.train}</span><span className="num">{ld[legI] ? `${hm(ld[legI].dep, tz)} → ${hm(ld[legI].arr, tz)}` : `${l.dep} → ${l.arr}`}</span>{delay > 0 && <span className="chip paid num">{fmt(manual > 0 ? j.lateBy : j.lateAuto, { m: delay })}</span>}{l.pf && <span className="chip">{t.pf.short} {l.pf}</span>}</div>
            <ol className="jf-stops">
              {st.map((s, x) => (
                <li key={x} className={x <= k ? "past" : x === k + 1 ? "next" : ""}>
                  <span className="jf-dot" aria-hidden="true" />
                  <span>{s.n}</span>
                  {x === k + 1 && phase.k === "ride" && <small>{x === st.length - 1 ? j.getOffHere : j.next}</small>}
                </li>
              ))}
            </ol>
            {st.length === 2 && <p className="hint">{j.timesOnly}</p>}
            {r.id.startsWith("adhoc-") && r.notes && <p className="hint">{r.notes}</p>}
          </section>
        )}

        {phase.k !== "done" && (
          <div className="jf-late" role="group" aria-label={j.late}>
            <span>⏱ {j.late}</span>
            {[5, 10, 15].map((m) => <button key={m} type="button" className="chip press num" onClick={() => setDelay((d) => Math.min(180, (d || auto) + m))}>+{m}</button>)}
            {manual > 0 && <button type="button" className="link-btn" onClick={() => setDelay(0)}>{j.onTime}</button>}
          </div>
        )}
        <p className="jf-pf">⚠️ {j.pfCheck}</p>
        {prefs.wheel && <p className="jf-pf">♿ {j.assist}</p>}

        <div className="jf-opts">
          <label className="jf-sw"><input type="checkbox" checked={keepOn} onChange={(e) => setKeepOn(e.target.checked)} /> {j.keepOn}</label>
          <small className="hint">{keepOn ? (lockOk ? j.keepOnHint : j.keepOnNo) : ""} {isNative() ? j.lockNote : j.lockNoteWeb}</small>
          <small className="hint">📍 {gps === "on" ? j.gps : gps === "off" ? j.gpsOff : "…"}</small>
        </div>

        <button type="button" className="link-btn" onClick={() => setShowPrefs((v) => !v)} aria-expanded={showPrefs}>⚙️ {j.prefs}</button>
        {showPrefs && (
          <div className="jf-prefs">
            <b>{j.modes}</b>
            <div className="jf-modes">
              {ALL_MODES.map((m) => {
                const on = prefs.modes.includes(m);
                return <label key={m} className="jf-sw"><input type="checkbox" checked={on} onChange={() => { const nx = on ? prefs.modes.filter((x) => x !== m) : [...prefs.modes, m]; if (nx.length) void saveTransit({ modes: nx }); }} /> <span className="jf-cap">{t[m]}</span></label>;
              })}
            </div>
            <b>{j.routeT}</b>
            <div className="jf-route" role="radiogroup">
              {routeOpts.map((o) => <label key={o} className="jf-sw"><input type="radio" name="jf-route" checked={prefs.route === o} onChange={() => void saveTransit({ route: o })} /> {j.ro[o]}</label>)}
            </div>
            <small className="hint">{j.prefsHint}</small>
          </div>
        )}

        <div className="jf-acts">
          <button type="button" className="btn jf-end press" onClick={() => void end()}>{j.end}</button>
          <button type="button" className="btn tram press" onClick={onClose}>{j.hide}</button>
        </div>
      </div>
    </Portal>
  );
}
