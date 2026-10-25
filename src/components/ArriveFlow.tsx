"use client";
import { useDict } from "@/i18n/client-dict";
import { CitySwitch } from "./CitySwitch";
/**
 * "Acabei de chegar" / "Quero chegar a um lugar": onde está → para onde vai → como quer ir → um passo de cada vez,
 * com o texto das placas, "Não encontro", "Mostrar a alguém" e "Ouvir". O passo atual fica guardado (volta onde estava).
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Hand, Home, LocateFixed, MapPin, Plane, Search, Ship, TrainFront, Volume2, X } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { useArrivalTx } from "@/lib/arrival-text";
import { arrivalsFor, fareText, optionName, type ArrivalPoint, type Step } from "@/data/arrivals";
import { km } from "@/lib/route-cost";
import Portal from "./Portal";
import { MiniRoute } from "./MiniRoute";
import { openLink } from "./ExtLink";
import type { GuideStep } from "@/lib/route-steps";

export type ArriveCity = { id: string; name: string; center: { lat: number; lng: number }; ap: { name: string; iata: string; lat: number; lng: number } | null; air: { min: number; line: string } };
/** g = veio da Google (não se desenha em mapas que não são da Google, por exigência dos termos da Google). */
type Place = { label: string; lat: number; lng: number; g?: boolean };
type State = { city: string; point: string | null; dest: Place | null; opt: string | null; step: number; at: number };
type TOpt = { dep: string; min: number; fare: string; walkMin: number; lines: { name: string; vehicle: string; from: string; headsign: string; stops: number }[] };
const KEY = "sgct:arrive";
const homeKey = (c: string) => `sgct:home:${c}`;
const fresh = (city: string): State => ({ city, point: null, dest: null, opt: null, step: 0, at: Date.now() });

function say(text: string, locale: string) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = locale; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* sem voz */ }
}

/** Cidade da app mais perto de uma posição (e a distância em km). */
function nearestCity(cities: ArriveCity[], pos: { lat: number; lng: number }) {
  return cities.map((c) => ({ c, d: km(pos, c.center) })).sort((u, v) => u.d - v.d)[0] ?? null;
}
const NEAR_KM = 80;
const fmtKm = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${Math.round(d)} km`);

export function ArriveFlow({ t: tProp, locale, cities, initial, go, explicit = true }: { t?: Dict; locale: Locale; cities: ArriveCity[]; initial: string; go: boolean; explicit?: boolean }) {
  const t = useDict(tProp);
  const a = t.arv;
  const tx = useArrivalTx(locale);
  const [st, setSt] = useState<State>(fresh(initial));
  const [ready, setReady] = useState(false);
  // Retoma onde estava (até 12 h), se for a mesma cidade.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as State | null;
      if (v && v.city === initial && Date.now() - v.at < 12 * 3600_000) setSt(v);
      else {
        const h = JSON.parse(localStorage.getItem(homeKey(initial)) ?? "null") as Place | null;
        setSt({ ...fresh(initial), dest: h, point: go ? "here" : null });
      }
    } catch { /* ignorar */ }
    setReady(true);
  }, [initial, go]);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify({ ...st, at: Date.now() })); } catch { /* ignorar */ } }, [st, ready]);
  const set = (p: Partial<State>) => setSt((x) => ({ ...x, ...p }));
  // Sem cidade no endereço: se a localização já estiver autorizada, abre na cidade onde o viajante está.
  useEffect(() => {
    if (explicit || !navigator.permissions?.query) return;
    void navigator.permissions.query({ name: "geolocation" as PermissionName }).then((r) => {
      if (r.state !== "granted") return;
      navigator.geolocation.getCurrentPosition((p) => {
        const n = nearestCity(cities, { lat: p.coords.latitude, lng: p.coords.longitude });
        if (n && n.d < NEAR_KM && n.c.id !== initial) location.replace(`/${locale}/arrive?city=${n.c.id}`);
      }, () => undefined, { timeout: 8000, maximumAge: 300_000 });
    }).catch(() => undefined);
  }, [explicit]); // eslint-disable-line react-hooks/exhaustive-deps

  const city = cities.find((c) => c.id === st.city) ?? cities[0];
  // Pontos de chegada: os da VOYBU (Londres primeiro) ou, sem dados, o aeroporto principal com a ligação habitual.
  const points: ArrivalPoint[] = useMemo(() => {
    const cur = arrivalsFor(city.id);
    if (cur.length) return cur;
    if (!city.ap) return [];
    return [{ id: "ap", kind: "airport", name: city.ap.name, code: city.ap.iata, lat: city.ap.lat, lng: city.ap.lng, options: [{
      id: "ap-usual", name: city.air.line || t.bpTransit, min: city.air.min, fare: "", to: { name: t.arv.centre, lat: city.center.lat, lng: city.center.lng },
      steps: [{ pt: city.air.line ? `Siga as placas para: ${city.air.line}.` : "Siga as placas de transportes públicos para o centro.", en: city.air.line ? `Follow the signs for: ${city.air.line}.` : "Follow the public transport signs into the centre.", sign: city.air.line || undefined }]
    }] }];
  }, [city, t]);
  const curated = arrivalsFor(city.id).length > 0;
  const point = points.find((p) => p.id === st.point) ?? null;
  const opt = point?.options.find((o) => o.id === st.opt) ?? (point?.options.length === 1 ? point.options[0] : null);

  // "Quero chegar a um lugar" (ou localização): parte de onde está.
  const [here, setHere] = useState<Place | null>(null);
  const [msg, setMsg] = useState("");
  function locate() {
    setMsg("…");
    navigator.geolocation?.getCurrentPosition((p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      // Está noutra cidade da app? Muda para essa cidade (e continua a partir de onde está).
      const nc = nearestCity(cities, pos);
      if (nc && nc.d < NEAR_KM && nc.c.id !== city.id && km(pos, city.center) > NEAR_KM) { location.href = `/${locale}/arrive?city=${nc.c.id}&go=1`; return; }
      const near = points.map((x) => ({ x, d: km(pos, x) })).sort((u, v) => u.d - v.d)[0];
      setMsg("");
      if (near && near.d < 3) { set({ point: near.x.id, opt: null, step: 0 }); return; }
      setHere({ label: t.bpHereLabel, ...pos }); set({ point: "here", opt: null, step: 0 });
    }, () => setMsg(t.bpDenied), { enableHighAccuracy: true, timeout: 12000 });
  }

  // Vindo de "Quero chegar a um lugar" (ou de outra cidade): localiza logo.
  useEffect(() => { if (ready && go && st.point === "here" && !here) locate(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const [show, setShow] = useState<string | null>(null);
  // "Cheguei": confirma pela posição; longe do destino, pergunta antes de dar por concluído.
  const [arrive, setArrive] = useState<null | { kind: "checking" } | { kind: "far"; d: number } | { kind: "ask" }>(null);
  // Último troço (do ponto onde sai até ao destino), passo a passo e calculado agora.
  const hubP: Place | null = opt ? { label: opt.to.name, lat: opt.to.lat, lng: opt.to.lng } : here;
  const [fin, setFin] = useState<GuideStep[] | null>(null);
  useEffect(() => {
    setFin(null);
    if (!hubP || !st.dest) return;
    if (km(hubP, st.dest) < 0.05) { setFin([]); return; }
    const walk = km(hubP, st.dest) < 1.2 ? "&mode=walk" : "";
    fetch(`/api/route-steps?from=${hubP.lat},${hubP.lng}&to=${st.dest.lat},${st.dest.lng}&lang=${locale}${walk}`).then((r) => (r.ok ? r.json() : null))
      .then((j: { steps?: GuideStep[] } | null) => setFin(j?.steps ?? [])).catch(() => setFin([]));
  }, [hubP?.lat, hubP?.lng, st.dest?.lat, st.dest?.lng, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const [lost, setLost] = useState<Step | null>(null);

  if (!ready) return <p className="hint" style={{ marginTop: 24 }}>…</p>;

  /* ---------- 1. Onde está agora? ---------- */
  if (!st.point || (st.point === "here" && !here)) return (
    <div className="arv">
      <CityBar t={t} cities={cities} city={city} onChange={(id) => { location.href = `/${locale}/arrive?city=${id}`; }} />
      <h1 className="arv-h">{a.where}</h1>
      <button type="button" className="arv-card press" onClick={locate}><span className="arv-ic"><LocateFixed size={22} aria-hidden="true" /></span><span className="arv-tx"><b>{a.here}</b></span><ChevronRight size={18} className="arv-chev" aria-hidden="true" /></button>
      {msg && <p className="hint">{msg === "…" ? "…" : msg}</p>}
      <div className="arv-list">
        {points.map((p) => (
          <button key={p.id} type="button" className="arv-card press" onClick={() => set({ point: p.id, opt: null, step: 0 })}>
            <span className="arv-ic">{p.kind === "airport" ? <Plane size={22} aria-hidden="true" /> : p.kind === "port" ? <Ship size={22} aria-hidden="true" /> : <TrainFront size={22} aria-hidden="true" />}</span>
            <span className="arv-tx"><b>{p.name}</b>{p.code && <small>{p.code}</small>}</span><ChevronRight size={18} className="arv-chev" aria-hidden="true" />
          </button>
        ))}
      </div>
      {!curated && <p className="arv-note">{a.noData}</p>}
    </div>
  );

  /* ---------- 2. Para onde vai? ---------- */
  if (!st.dest) return (
    <div className="arv">
      <BackBar t={t} onBack={() => set({ point: null })} label={point?.name ?? here?.label ?? ""} />
      <h1 className="arv-h">{a.dest}</h1>
      <DestSearch t={t} locale={locale} city={city.id} onPick={(d) => set({ dest: d, step: 0 })} />
      {opt?.to && <button type="button" className="arv-card press" onClick={() => set({ dest: { label: opt.to.name, lat: opt.to.lat, lng: opt.to.lng }, step: 0 })}><span className="arv-ic"><MapPin size={22} aria-hidden="true" /></span><span className="arv-tx"><b>{a.centre}</b><small>{opt.to.name}</small></span><ChevronRight size={18} className="arv-chev" aria-hidden="true" /></button>}
      {!opt?.to && <button type="button" className="arv-card press" onClick={() => set({ dest: { label: a.centre, ...city.center }, step: 0 })}><span className="arv-ic"><MapPin size={22} aria-hidden="true" /></span><span className="arv-tx"><b>{a.centre}</b></span><ChevronRight size={18} className="arv-chev" aria-hidden="true" /></button>}
    </div>
  );

  /* ---------- 3. Como quer ir? ---------- */
  if (point && !opt) return (
    <div className="arv">
      <BackBar t={t} onBack={() => set({ dest: null })} label={`${point.name} → ${st.dest.label}`} />
      <h1 className="arv-h">{a.how}</h1>
      <div className="arv-list">
        {point.options.map((o) => (
          <button key={o.id} type="button" className="arv-opt press" onClick={() => set({ opt: o.id, step: 0 })}>
            <span className="arv-tx"><b>{optionName(o, locale)}</b>{o.note && <small>{tx(o.note)}</small>}</span>
            <span className="arv-meta num"><b>{o.min} min</b>{o.fare && <small>{fareText(o.fare, locale)}</small>}</span>
          </button>
        ))}
      </div>
      <p className="arv-note">{a.source}</p>
    </div>
  );

  /* ---------- 4. Um passo de cada vez ---------- */
  const steps: Step[] = opt ? opt.steps : [];
  const finSteps = fin ?? [];
  const total = steps.length + Math.max(1, finSteps.length); // + o troço final até ao destino
  const i = Math.min(st.step, total);
  const hub: Place | null = opt ? { label: opt.to.name, lat: opt.to.lat, lng: opt.to.lng } : here;
  const doneAll = i >= total;
  const goHome = () => { if (st.dest?.label === a.centre) return; try { localStorage.setItem(homeKey(city.id), JSON.stringify(st.dest)); } catch { /* ignorar */ } };
  const finish = () => { setArrive(null); goHome(); set({ step: total }); };
  function checkArrival() {
    if (!navigator.geolocation || !st.dest) { setArrive({ kind: "ask" }); return; }
    setArrive({ kind: "checking" });
    navigator.geolocation.getCurrentPosition((p) => {
      const d = km({ lat: p.coords.latitude, lng: p.coords.longitude }, st.dest!);
      if (d <= 0.3) finish(); else setArrive({ kind: "far", d });
    }, () => setArrive({ kind: "ask" }), { enableHighAccuracy: true, timeout: 10000, maximumAge: 30_000 });
  }

  if (doneAll) return (
    <div className="arv arv-done">
      <span className="arv-ok" aria-hidden="true"><Check size={34} /></span>
      <h1 className="arv-h">{a.done}</h1>
      <p>{st.dest.label === a.centre ? fmt(t.arvDoneC, { x: st.dest.label }) : fmt(a.doneSub, { x: st.dest.label })}</p>
      <a className="btn tram press" href={`/${locale}/start?city=${city.id}`}>{t.nn.explore}</a>
      <button type="button" className="btn ghost press" onClick={() => { setSt(fresh(city.id)); }}>{a.restart}</button>
    </div>
  );

  const step = i < steps.length ? steps[i] : null;
  const g = !step && finSteps.length ? finSteps[i - steps.length] : null;
  const gText = g ? (g.k === "walk" ? `${g.text || fmt(a.walkM, { m: g.m })}` : `${fmt(a.take, { line: g.line || g.vehicle, h: g.headsign, from: g.from })} ${fmt(a.exit, { to: g.to, n: g.stops })}`) : "";
  return (
    <div className="arv arv-run">
      <BackBar t={t} onBack={() => (i > 0 ? set({ step: i - 1 }) : set({ opt: null }))} label={`${point?.name ?? here?.label ?? ""} → ${st.dest.label}`} onClose={() => setSt(fresh(city.id))} />
      <div className="arv-prog" aria-hidden="true">{Array.from({ length: total }, (_, k) => <i key={k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
      <small className="arv-stepn">{fmt(a.step, { i: i + 1, n: total })}</small>
      {step ? (
        <section className="arv-step" aria-live="polite">
          <p className="arv-say">{tx(step)}</p>
          {step.sign && <div className="arv-sign" aria-label={step.sign}>{step.sign}</div>}
          {step.min && <small className="arv-time">≈ {step.min} min</small>}
        </section>
      ) : g ? (
        <section className="arv-step" aria-live="polite">
          <small className="arv-eyebrow">{t.arv.final} · {t.arv.live}</small>
          <p className="arv-say">{gText}</p>
          {g.k === "transit" ? <div className="arv-sign" style={g.color ? { boxShadow: `inset 6px 0 0 ${g.color}` } : undefined}>{g.line || g.vehicle}{g.headsign ? ` → ${g.headsign}` : ""}</div>
            : <div className="arv-sign sm">{fmt(a.walkM, { m: g.m })}</div>}
          <small className="arv-time">≈ {g.min} min</small>
          {!st.dest.g && <MiniRoute from={{ ...hub!, label: hub!.label }} to={st.dest} />}
          <button type="button" className="link-btn" onClick={() => void openLink(`https://www.google.com/maps/dir/?api=1&origin=${hub!.lat},${hub!.lng}&destination=${st.dest!.lat},${st.dest!.lng}&travelmode=${g.k === "walk" && finSteps.length === 1 ? "walking" : "transit"}`)}>{t.arvMapAlt} ↗</button>
        </section>
      ) : hub && (
        <FinalLeg t={t} locale={locale} from={hub} to={st.dest} />
      )}
      <div className="arv-acts">
        <button type="button" className="btn tram press arv-next" onClick={() => { if (i + 1 >= total) checkArrival(); else set({ step: i + 1 }); }} disabled={arrive?.kind === "checking"}>{arrive?.kind === "checking" ? t.arvChecking : a.next}</button>
        <div className="arv-row">
          <button type="button" className="arv-sm press" onClick={() => setLost(step ?? { pt: st.dest!.label, en: st.dest!.label })}><Hand size={18} aria-hidden="true" /> {a.lost}</button>
          <button type="button" className="arv-sm press" onClick={() => setShow(step?.sign ?? (g?.k === "transit" ? `${g.line} → ${g.headsign}` : st.dest!.label))}><MapPin size={18} aria-hidden="true" /> {a.show}</button>
          {(step || g) && <button type="button" className="arv-sm press" onClick={() => say(step ? tx(step) : gText, locale)}><Volume2 size={18} aria-hidden="true" /> {a.listen}</button>}
        </div>
      </div>
      <p className="arv-note">{a.source}</p>

      {arrive && arrive.kind !== "checking" && (
        <Portal><div className="as-bg" onClick={() => setArrive(null)}>
          <div className="as" role="dialog" aria-modal="true" aria-label={fmt(t.arvAsk, { x: st.dest.label })} onClick={(e) => e.stopPropagation()}>
            <span className="as-grab" aria-hidden="true" />
            <div className="as-group arv-lost">
              {arrive.kind === "far" && <p>{fmt(t.arvChk, { d: fmtKm(arrive.d), x: st.dest.label })}</p>}
              <b>{fmt(t.arvAsk, { x: st.dest.label })}</b>
              <button type="button" className="btn tram press" onClick={() => setArrive(null)}>{t.arvKeep}</button>
              <button type="button" className="btn ghost press" onClick={finish}>{t.arvYes}</button>
            </div>
          </div>
        </div></Portal>
      )}
      {show && (
        <Portal><div className="arv-show" role="dialog" aria-modal="true" onClick={() => setShow(null)}>
          <button type="button" className="mu2-x arv-show-x" aria-label={t.close}><X size={20} aria-hidden="true" /></button>
          <small>{a.looking}</small>
          <b>{show}</b>
          {st.dest && show !== st.dest.label && <><small>{a.showT}</small><span>{st.dest.label}</span></>}
        </div></Portal>
      )}
      {lost && (
        <Portal><div className="as-bg" onClick={() => setLost(null)}>
          <div className="as" role="dialog" aria-modal="true" aria-label={a.lostT} onClick={(e) => e.stopPropagation()}>
            <span className="as-grab" aria-hidden="true" />
            <div className="as-group arv-lost">
              <b>{a.lostT}</b>
              {lost.sign && <div className="arv-sign sm">{lost.sign}</div>}
              <ol><li>{a.tip1}</li><li>{a.tip2}</li><li>{a.tip3}</li></ol>
              <button type="button" className="btn ghost" onClick={() => { setShow(lost.sign ?? st.dest!.label); setLost(null); }}>{a.show}</button>
              {hub && <button type="button" className="link-btn" onClick={() => void openLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lost.sign ?? st.dest!.label)}`)}>{t.arvMapAlt} ↗</button>}
            </div>
            <button type="button" className="as-cancel" onClick={() => setLost(null)}>{t.close}</button>
          </div>
        </div></Portal>
      )}
    </div>
  );
}

function CityBar({ t, cities, city, onChange }: { t: Dict; cities: ArriveCity[]; city: ArriveCity; onChange: (id: string) => void }) {
  return (
    <div className="arv-city">
      <span>{t.arv.city}</span>
      <CitySwitch className="cs-inline" current={city.id} cities={cities.map((c) => ({ id: c.id, name: c.name }))} label={t.arv.city} placeholder={t.spCity} none={t.gsNone} onPick={onChange} />
    </div>
  );
}
function BackBar({ t, onBack, label, onClose }: { t: Dict; onBack: () => void; label: string; onClose?: () => void }) {
  return (
    <div className="arv-bar">
      <button type="button" className="arv-back" onClick={onBack} aria-label={t.arv.back}><ArrowLeft size={22} aria-hidden="true" /></button>
      <span className="arv-ctx">{label}</span>
      {onClose && <button type="button" className="arv-back" onClick={onClose} aria-label={t.arv.restart}><X size={20} aria-hidden="true" /></button>}
    </div>
  );
}

function DestSearch({ t, locale, city, onPick }: { t: Dict; locale: Locale; city: string; onPick: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ label: string; sub: string; lat: number; lng: number; g?: boolean }[] | null>(null);
  const [other, setOther] = useState<{ city: string; name: string } | null>(null);
  const [home, setHome] = useState<Place | null>(null);
  useEffect(() => { try { setHome(JSON.parse(localStorage.getItem(homeKey(city)) ?? "null")); } catch { /* ignorar */ } }, [city]);
  useEffect(() => {
    const v = q.trim(); if (v.length < 4) { setHits(null); return; }
    const id = setTimeout(() => {
      fetch(`/api/geocode?city=${city}&lang=${locale}&q=${encodeURIComponent(v)}`).then((r) => (r.ok ? r.json() : null)).then((j) => { setHits(j?.hits ?? []); setOther(j?.elsewhere ?? null); }).catch(() => setHits([]));
    }, 800); // espera que acabe de escrever (menos pedidos ao serviço de moradas)
    return () => clearTimeout(id);
  }, [q, city, locale]);
  return (
    <div className="stack" style={{ gap: 8 }}>
      {home && <button type="button" className="arv-card press" onClick={() => onPick(home)}><span className="arv-ic"><Home size={22} aria-hidden="true" /></span><span className="arv-tx"><b>{t.arv.home}</b><small>{home.label}</small></span><ChevronRight size={18} className="arv-chev" aria-hidden="true" /></button>}
      <label className="arv-search"><Search size={18} aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.arv.destPh} aria-label={t.arv.destPh} autoComplete="off" /></label>
      {hits && (hits.length ? hits.map((h, k) => (
        <button key={k} type="button" className="arv-card press" onClick={() => onPick({ label: h.label, lat: h.lat, lng: h.lng, g: h.g })}><span className="arv-ic"><MapPin size={20} aria-hidden="true" /></span><span className="arv-tx"><b>{h.label}</b>{h.sub && <small>{h.sub}</small>}</span></button>
      )) : other ? (
        <div className="card note-card"><p>{fmt(t.arvElsewhere, { c: other.name })}</p><a className="btn tram press" href={`/${locale}/arrive?city=${other.city}`}>{fmt(t.arvSwitchBtn, { c: other.name })}</a></div>
      ) : <p className="hint">{t.bpNone}</p>)}
    </div>
  );
}

/** Último troço: do ponto onde saiu até ao destino (horários ao vivo se houver; sempre com o mapa). */
function FinalLeg({ t, locale, from, to }: { t: Dict; locale: Locale; from: Place; to: Place }) {
  const [opts, setOpts] = useState<TOpt[] | null>(null);
  const d = km(from, to);
  useEffect(() => {
    if (d < 1) { setOpts([]); return; }
    fetch(`/api/transit?from=${from.lat},${from.lng}&to=${to.lat},${to.lng}&lang=${locale}`).then((r) => (r.ok ? r.json() : null)).then((j) => setOpts(j?.options ?? [])).catch(() => setOpts([]));
  }, [from.lat, from.lng, to.lat, to.lng, locale, d]);
  const mode = d < 1.2 ? "walking" : "transit";
  const o = opts?.[0];
  return (
    <section className="arv-step">
      <small className="arv-eyebrow">{t.arv.final}</small>
      <p className="arv-say">{d < 0.1 ? to.label : fmt(t.arv.finalSub, { a: from.label, b: to.label })}</p>
      {d < 0.1 ? null : d < 1.2 ? <div className="arv-sign">{t.walk} · ≈ {Math.max(2, Math.round(d * 13))} min</div>
        : opts === null ? <p className="hint">…</p>
          : o ? <div className="arv-lines">{o.lines.map((l, k) => <div key={k} className="arv-sign sm">{l.name || l.vehicle}{l.headsign ? ` → ${l.headsign}` : ""}{l.from ? ` · ${l.from}` : ""}</div>)}<small className="arv-time">≈ {o.min} min{o.fare ? ` · ${o.fare}` : ""}</small></div>
            : null}
      {d > NEAR_KM ? <p className="note">{fmt(t.arvFar, { d: fmtKm(d) })}</p> : d >= 0.1 && !to.g && <MiniRoute from={from} to={to} />}
      <button type="button" className="link-btn" onClick={() => void openLink(`https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=${mode}`)}>{t.arvMapAlt} ↗</button>
    </section>
  );
}
