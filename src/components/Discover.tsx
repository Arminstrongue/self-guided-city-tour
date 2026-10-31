"use client";
/**
 * Descobrir a cidade: mais lugares (por tipo e pela distância a si), ruas e bairros para passear e passeios a pé
 * com os pontos por ordem. Cada lugar: navegar dentro da VOYBU, ver no mapa e site oficial. Passeio: guia ponto a ponto.
 */
import { useEffect, useMemo, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import type { Leg, Stop } from "@/data/cities";
import type { Discover, DPlace, DWalk } from "@/lib/discover";
import type { Focus } from "./MapView";
import { NavSheet } from "./NavSheet";
import { ExtLink } from "./ExtLink";
import Portal from "./Portal";

type Pos = { lat: number; lng: number };
const KIND_ICON: Record<string, string> = { sight: "📸", museum: "🏛", gallery: "🖼", park: "🌳", market: "🛍", view: "🌄", church: "⛪", palace: "🏰", district: "🏘", landmark: "📍", food: "🍽" };
const dist = (a: Pos, b: Pos) => {
  const x = ((b.lng - a.lng) * Math.PI / 180) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = (b.lat - a.lat) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371000;
};
const fmtD = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const asStop = (id: string, n: string, a: string, lat: number, lng: number): Stop => ({ id, n, a, lat, lng, v: 0, leg: { m: "walk", min: 0 }, pt: "", en: "" });

function useDiscover(cityId: string) {
  const [d, setD] = useState<Discover | null | "none">(null);
  useEffect(() => {
    let on = true;
    fetch(`/api/discover?city=${cityId}`).then((r) => (r.ok ? r.json() : null)).then((j: Discover | null) => { if (on) setD(j ?? "none"); }).catch(() => { if (on) setD("none"); });
    return () => { on = false; };
  }, [cityId]);
  return d;
}

export function DiscoverCard({ t, locale, cityId, cityName, pos, gmapsKey, onShow }: {
  t: Dict; locale: Locale; cityId: string; cityName: string; pos: Pos | null; gmapsKey?: string; onShow: (f: Focus) => void;
}) {
  const d = useDiscover(cityId);
  const [open, setOpen] = useState(false);
  if (!d || d === "none") return null;
  const near = [...d.places].map((p) => ({ p, m: pos ? dist(pos, p) : null })).sort((a, b) => (a.m ?? (a.p.top ? 0 : 1)) - (b.m ?? (b.p.top ? 0 : 1))).slice(0, 6);
  return (
    <section className="dc card" aria-label={fmt(t.dc.title, { c: cityName })}>
      <div className="dc-head">
        <div><b className="dc-t">🧭 {fmt(t.dc.title, { c: cityName })}</b><span className="dc-s">{fmt(t.dc.sub, { p: d.places.length, s: d.streets.length, w: d.walks.length })}</span></div>
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>{t.dc.seeAll} ›</button>
      </div>
      <div className="dc-rail">
        {near.map(({ p, m }) => (
          <button key={p.id} type="button" className="dc-mini press" onClick={() => setOpen(true)}>
            <span className="dc-ic" aria-hidden="true">{KIND_ICON[p.k] ?? "📍"}</span>
            <b>{p.n}</b><small className="num">{m !== null ? fmtD(m) : p.a}</small>
          </button>
        ))}
      </div>
      {open && <DiscoverSheet t={t} locale={locale} d={d} cityName={cityName} pos={pos} gmapsKey={gmapsKey} onShow={(f) => { setOpen(false); onShow(f); }} onClose={() => setOpen(false)} />}
    </section>
  );
}

function DiscoverSheet({ t, locale, d, cityName, pos, gmapsKey, onShow, onClose }: {
  t: Dict; locale: Locale; d: Discover; cityName: string; pos: Pos | null; gmapsKey?: string; onShow: (f: Focus) => void; onClose: () => void;
}) {
  const c = t.dc;
  const [tab, setTab] = useState<"places" | "streets" | "walks">("places");
  const [kind, setKind] = useState<string>("");
  const [nav, setNav] = useState<{ stop: Stop; next: Stop | null; walk?: { w: DWalk; i: number } } | null>(null);
  const txt = (x: { en: string; pt: string }) => (locale === "pt" ? x.pt : x.en);
  const kinds = useMemo(() => [...new Set(d.places.map((p) => p.k))], [d.places]);
  const places = useMemo(() => d.places.filter((p) => !kind || p.k === kind).map((p) => ({ p, m: pos ? dist(pos, p) : null }))
    .sort((a, b) => (a.m !== null && b.m !== null ? a.m - b.m : Number(Boolean(b.p.top)) - Number(Boolean(a.p.top)))), [d.places, kind, pos]);
  const streets = useMemo(() => d.streets.map((s) => ({ s, m: pos ? dist(pos, s) : null })).sort((a, b) => (a.m ?? 0) - (b.m ?? 0)), [d.streets, pos]);
  const leg: Leg = { m: "walk", min: 0 };
  const go = (p: { id: string; n: string; a: string; lat: number; lng: number }) => setNav({ stop: asStop(p.id, p.n, p.a, p.lat, p.lng), next: null });
  const startWalk = (w: DWalk, i = 0) => {
    const a = w.pts[i], b = w.pts[i + 1];
    setNav({ stop: asStop(`${w.id}-${i}`, a.n, locale === "pt" ? w.pt_n : w.en_n, a.lat, a.lng), next: b ? asStop(`${w.id}-${i + 1}`, b.n, "", b.lat, b.lng) : null, walk: { w, i } });
  };
  const local = (p: DPlace) => (p.ja && locale !== "ja" ? p.ja : null);

  return (
    <Portal>
      <div className="dcs" role="dialog" aria-label={fmt(c.title, { c: cityName })}>
        <header className="dcs-h">
          <b className="dcs-t">🧭 {fmt(c.title, { c: cityName })}</b>
          <button type="button" className="nav-x" onClick={onClose} aria-label={t.close}>✕</button>
        </header>
        <div className="tabs dcs-tabs" role="tablist">
          {(["places", "streets", "walks"] as const).map((k) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{c[k]}</button>)}
        </div>
        <div className="dcs-body">
          {tab === "places" && <>
            <div className="dcs-kinds">
              <button type="button" className={`dc-kind press${!kind ? " on" : ""}`} onClick={() => setKind("")}>{c.all}</button>
              {kinds.map((k) => <button key={k} type="button" className={`dc-kind press${kind === k ? " on" : ""}`} onClick={() => setKind(k)}>{KIND_ICON[k] ?? "📍"} {c.k[k as keyof typeof c.k] ?? k}</button>)}
            </div>
            {pos && <p className="hint">📍 {c.byDist}</p>}
            {places.map(({ p, m }) => (
              <article key={p.id} className="dc-item">
                <div className="dc-ih">
                  <span className="dc-ic" aria-hidden="true">{KIND_ICON[p.k] ?? "📍"}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <b className="dc-in">{p.n}{p.top && <span className="top-badge">{t.topStop}</span>}</b>
                    {local(p) && <span className="dc-local" lang="ja">{local(p)}</span>}
                    <small className="dc-meta num">{p.a}{m !== null ? ` · ${fmtD(m)} · ${Math.max(1, Math.round(m * 1.25 / 80))} min` : ""}{p.free ? ` · ${t.free}` : ""}</small>
                  </div>
                </div>
                <p className="dc-tx">{txt(p)}</p>
                <div className="dc-acts">
                  <button type="button" className="btn press dc-go" onClick={() => go(p)}>🧭 {t.nav.go}</button>
                  <button type="button" className="btn ghost press" onClick={() => onShow({ lat: p.lat, lng: p.lng, name: p.n, walk: true })}>🗺 {c.map}</button>
                  {p.url && <ExtLink className="link-btn" href={p.url}>{c.site} ↗</ExtLink>}
                </div>
              </article>
            ))}
          </>}
          {tab === "streets" && streets.map(({ s, m }) => (
            <article key={s.id} className="dc-item">
              <div className="dc-ih"><span className="dc-ic" aria-hidden="true">🚶</span>
                <div style={{ minWidth: 0, flex: 1 }}><b className="dc-in">{s.n}</b><small className="dc-meta num">{s.a}{m !== null ? ` · ${fmtD(m)}` : ""}</small></div></div>
              <p className="dc-tx">{txt(s)}</p>
              <div className="dc-acts"><button type="button" className="btn press dc-go" onClick={() => go(s)}>🧭 {t.nav.go}</button>
                <button type="button" className="btn ghost press" onClick={() => onShow({ lat: s.lat, lng: s.lng, name: s.n, walk: true })}>🗺 {c.map}</button></div>
            </article>
          ))}
          {tab === "walks" && d.walks.map((w) => (
            <article key={w.id} className="dc-item dc-walk">
              <b className="dc-in">🚶 {locale === "pt" ? w.pt_n : w.en_n}</b>
              <small className="dc-meta num">{fmt(c.km, { km: w.km.toFixed(1), m: w.min })} · {fmt(c.pts, { n: w.pts.length })}</small>
              <p className="dc-tx">{txt(w)}</p>
              <ol className="dc-pts">{w.pts.map((x, i) => <li key={i}><span className="num">{i + 1}</span>{x.n}</li>)}</ol>
              <button type="button" className="btn press dc-go" onClick={() => startWalk(w)}>▶ {c.start}</button>
            </article>
          ))}
          <small className="hint">{c.note}</small>
        </div>
      </div>
      {/* "Cheguei" num passeio: fecha e abre logo o ponto seguinte (key nova = estado novo). */}
      {nav && <NavSheet key={nav.stop.id} t={t} locale={locale} stop={nav.stop} leg={leg} next={nav.next} from={pos} stops={[nav.stop]} done={{}} museums={[]} gmapsKey={gmapsKey}
        onArrive={() => { if (nav.walk && nav.walk.i + 1 < nav.walk.w.pts.length) { const { w, i } = nav.walk; setTimeout(() => startWalk(w, i + 1), 0); } }}
        onClose={() => setNav(null)} />}
    </Portal>
  );
}
