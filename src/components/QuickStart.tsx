"use client";
import { useDict } from "@/i18n/client-dict";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Clock, MapPin, Play, Search } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { availableMin, breakdownOf, cityNowLocal, defaultTrip, tripReady, tripWindow, whenLabel, type Trip } from "@/lib/trip";
import { TimeBreakdown, TripPicker, endIcon, endLabel } from "./TripPicker";
import { loadTrip, saveTrip } from "./trip-store";
import { track } from "@/lib/track";

type LL = { lat: number; lng: number };
export type QsOption = { key: string; n: number; min: number; tour: number; air: number; ret: number; first: LL; last: LL; acc: number; cost: string; names: string[] };
export type QsCity = { id: string; name: string; country: string; flag: string; open: boolean; center: LL; tz: string; options: QsOption[] };

type Time = { k: string; min: number };
const fold = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hrs = (m: number) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, "0")}`;

/** Primeira experiência: 1) cidade, 2) tempo disponível, 3) começar (ou comprar) com o roteiro que cabe. */
export function QuickStart({ t: tProp, locale, cities, pre, from }: { t?: Dict; locale: Locale; cities: QsCity[]; pre: string; from: string }) {
  const t = useDict(tProp);
  const [cityId, setCityId] = useState(pre);
  const [time, setTime] = useState<Time | null>(null);
  const [trip, setTrip] = useState<Trip>(defaultTrip());
  const [later, setLater] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [shift, setShift] = useState(0); // "mais curto / mais longo" a partir do que cabe
  const step = !cityId ? 1 : !time ? 2 : 3;
  const city = cities.find((c) => c.id === cityId) ?? null;
  const tz = city?.tz ?? "UTC";
  const words = { today: t.tpToday, tomorrow: t.tpTomorrow };
  const when = (ms: number) => whenLabel(ms, tz, INTL_LOCALE[locale], words);
  // "Cerca de 3 horas" = tempo para passear (com ida e regresso), sem margem de partida; só "até à partida" soma a margem.
  const bd = (o: QsOption) => breakdownOf(o, time && time.k !== "dep" ? { ...trip, mode: "stay" } : trip);
  const pickCity = (id: string) => { setCityId(id); setQ(""); setTrip(loadTrip(id)); setLater(Boolean(loadTrip(id).startAt)); };
  const upd = (v: Trip) => { setTrip(v); setErr(""); };
  useEffect(() => { if (pre) { const v = loadTrip(pre); setTrip(v); setLater(Boolean(v.startAt)); } }, [pre]);

  const list = useMemo(() => { const f = fold(q.trim()); return f ? cities.filter((c) => fold(`${c.name} ${c.country}`).includes(f)) : cities; }, [q, cities]);
  const TIMES: { k: string; label: string; min: number }[] = [
    { k: "3h", label: t.qsT3, min: 180 }, { k: "5h", label: t.qsT5, min: 300 }, { k: "day", label: t.qsDay, min: 480 }, { k: "wk", label: t.qsWeekend, min: Infinity }
  ];

  const fitIdx = useMemo(() => {
    if (!city || !time) return -1;
    let best = -1;
    city.options.forEach((o, i) => { if (bd(o).total <= time.min) best = i; });
    return best;
  }, [city, time, trip]); // eslint-disable-line react-hooks/exhaustive-deps
  const idx = city && fitIdx >= 0 ? Math.max(0, Math.min(city.options.length - 1, fitIdx + shift)) : -1;
  const opt = city && idx >= 0 ? city.options[idx] : null;
  const win = tripWindow(trip, tz);

  /** Avança com um tempo escolhido; o início e o fim têm de estar definidos (comboio → estação, navio → terminal). */
  function choose(k: string, min: number | null) {
    if (!tripReady(trip)) { setErr(t.tpNeedEnd); return; }
    if (later && !trip.startAt) { setErr(t.tpNeedStart); return; }
    if (min === null) {
      const a = availableMin(trip, tz);
      if (a === null) { setErr(t.errDep); return; }
      setTime({ k, min: a });
    } else setTime({ k, min });
    setErr("");
  }

  /** Guarda o plano (início, fim, horas, roteiro) para o passeio, a amostra e a carteira usarem o mesmo. */
  function persist() {
    if (!city || !opt) return;
    const final: Trip = { ...trip, startAt: later ? trip.startAt : "", deadline: time?.k === "dep" ? trip.deadline : "", key: opt.key };
    saveTrip(city.id, final);
    try {
      localStorage.setItem(`sgct:lvl:${city.id}`, JSON.stringify(opt.key)); localStorage.setItem("sgct:onboarded", "1");
      const b = bd(opt);
      localStorage.setItem("sgct:planned", JSON.stringify({ city: city.id, key: opt.key, n: opt.n, h: hrs(b.total), tour: hrs(b.tour), names: opt.names, bd: b, base: endLabel(trip.start, t), end: endLabel(trip.end, t), mode: trip.mode, startAt: final.startAt, deadline: final.deadline, cost: opt.cost, open: city.open, at: Date.now() }));
    } catch { /* sem armazenamento */ }
  }
  // Rascunho automático: ao ver o resultado, o plano fica guardado (carteira: "Continuar de onde ficou").
  useEffect(() => { if (city && opt && tripReady(trip)) persist(); }, [city?.id, opt?.key, time?.k, trip]); // eslint-disable-line react-hooks/exhaustive-deps
  function go() {
    if (!city || !opt) return;
    persist();
    track("plan_done", { city: city.id, locale });
    if (city.open) { location.href = `/${locale}/tour/${city.id}`; return; }
    location.href = `/${locale}/c/${city.id}#book`;
  }
  const back = () => { if (step === 3) { setTime(null); setShift(0); } else if (step === 2) setCityId(""); };

  return (
    <section className="qs" aria-labelledby="qs-h">
      <div className="qs-head">
        {step > 1 && <button className="qs-back press" onClick={back} aria-label="←"><ArrowLeft size={18} aria-hidden="true" /></button>}
        <div>
          <span className="qs-kicker">{fmt(t.qsStep, { n: step })}</span>
          <h1 id="qs-h">{step === 1 ? t.qs1 : step === 2 ? fmt(t.qs2, { c: city?.name ?? "" }) : t.qs3}</h1>
        </div>
      </div>
      <ol className="qs-dots" aria-hidden="true">{[1, 2, 3].map((n) => <li key={n} className={n < step ? "done" : n === step ? "on" : ""}>{n < step ? <Check size={12} strokeWidth={3} /> : n}</li>)}</ol>

      {step === 1 && (
        <>
          <label className="pk-q qs-q"><Search size={16} aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.qsSearch} aria-label={t.qsSearch} autoComplete="off" /></label>
          <div className="qs-cities">
            {list.map((c) => (
              <button key={c.id} className="qs-city press" onClick={() => pickCity(c.id)}>
                <span className="qs-flag" aria-hidden="true">{c.flag}</span>
                <span className="qs-tx"><b>{c.name}</b><small>{c.country}</small></span>
                {c.open && <span className="qs-owned">{t.qsOpen}</span>}
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && city && (
        <div className="qs-times">
          <TripPicker t={t} locale={locale} city={city.id} cityName={city.name} center={city.center} value={trip} onChange={upd} />

          <span className="bp-h">{t.tpWhenStart}</span>
          <div className="bp-seg tp-seg" role="radiogroup" aria-label={t.tpWhenStart}>
            <button type="button" role="radio" aria-checked={!later} className={!later ? "on" : ""} onClick={() => { setLater(false); upd({ ...trip, startAt: "" }); }}>{t.tpNow}</button>
            <button type="button" role="radio" aria-checked={later} className={later ? "on" : ""} onClick={() => { setLater(true); if (!trip.startAt) upd({ ...trip, startAt: cityNowLocal(tz, 24 * 60).slice(0, 11) + "09:00" }); }}>{t.tpLater}</button>
          </div>
          {later && (
            <label className="field tp-dt"><span className="hint">{fmt(t.tpCityTime, { c: city.name })}</span>
              <input type="datetime-local" min={cityNowLocal(tz)} value={trip.startAt} onChange={(e) => upd({ ...trip, startAt: e.target.value })} /></label>
          )}

          <span className="bp-h">{t.qsHowLong}</span>
          <small className="hint">{t.tpDurHint}</small>
          <div className="qs-time qs-dep">
            <span className="qs-dep-l"><Clock size={18} aria-hidden="true" />{t.tpUntilDep[trip.mode]}</span>
            <span className="hint">{fmt(t.tpCityTime, { c: city.name })}</span>
            <input type="datetime-local" min={trip.startAt || cityNowLocal(tz)} value={trip.deadline} onChange={(e) => upd({ ...trip, deadline: e.target.value })} aria-label={t.tpUntilDep[trip.mode]} />
            <button className="btn tram" disabled={!trip.deadline} onClick={() => choose("dep", null)}>{t.qsNext}</button>
            {trip.mode !== "stay" && trip.mode !== "walk" && <small className="hint">{trip.mode === "plane" ? t.qsUntilHint : trip.mode === "train" ? t.qsHintTrain : trip.mode === "bus" ? t.tpDepHint.bus : t.qsHintShip}</small>}
          </div>
          {TIMES.map((x) => (
            <button key={x.k} className="qs-time press" onClick={() => choose(x.k, x.min)}><Clock size={18} aria-hidden="true" /><span>{x.label}</span><ChevronRight size={16} aria-hidden="true" /></button>
          ))}
          {err && <p className="err" role="alert">{err}</p>}
        </div>
      )}

      {step === 3 && city && (
        <div className="qs-result">
          {opt ? (
            <>
              <div className="qs-sum">
                <b>{city.flag} {city.name}</b>
                <span>{fmt(t.qsFits, { n: opt.n, h: hrs(bd(opt).total), c: opt.cost })}</span>
                <span className="qs-back-at">{endIcon(trip.start)} {endLabel(trip.start, t)} → {endIcon(trip.end)} {endLabel(trip.end, t)}</span>
                <span className="qs-back-at">{fmt(t.tpStartsAt, { t: later && trip.startAt ? when(win.start) : t.tpNow })}</span>
                <span className="qs-back-at">{fmt(t.bpBackAt, { p: endLabel(trip.end, t), t: when(win.start + bd(opt).total * 60000) })}</span>
                {time?.k === "dep" && win.dep !== null && <span className="qs-back-at">{fmt(t.tpDepAt, { m: t.tpModes[trip.mode], t: when(win.dep) })}</span>}
              </div>
              {time && time.k !== "dep" && <span className="hint">{fmt(t.tpDurFits, { h: hrs(time.min === Infinity ? bd(opt).total : time.min) })}</span>}
              <TimeBreakdown b={bd(opt)} t={t} trip={time && time.k !== "dep" ? { ...trip, mode: "stay" } : trip} hrs={hrs} />
              {opt.acc > 0 && <p className="hint">♿ {fmt(t.acSum, { n: opt.acc })}</p>}
              <ol className="qs-stops">{opt.names.map((n, i) => <li key={n + i}><span className="num">{i + 1}</span>{n}</li>)}</ol>
              <div className="qs-adj">
                <button className="link-btn" disabled={idx <= 0} onClick={() => setShift(shift - 1)}>− {t.qsShorter}</button>
                <button className="link-btn" disabled={idx >= city.options.length - 1} onClick={() => setShift(shift + 1)}>{t.qsLonger} +</button>
              </div>
              <button className="btn tram qs-go press" onClick={go}><Play size={18} aria-hidden="true" />{city.open ? t.qsStart : fmt(t.qsBuy, { p: from })}</button>
              {!city.open && <a className="btn ghost qs-try press" href={`/${locale}/tour/${city.id}`} onClick={persist}>🎧 {t.qsTry}</a>}
            </>
          ) : (
            <p className="fit bad">{fmt(t.qsNone, { h: hrs(city.options[0] ? bd(city.options[0]).total : 0) })}</p>
          )}
          <div className="qs-ess">
            <span className="qs-ess-h">{t.qsEss}</span>
            <a href={`/${locale}/c/${city.id}#today`} className="press"><MapPin size={15} aria-hidden="true" />{t.qsEssToday}</a>
            <a href={`/${locale}/c/${city.id}#safety`} className="press">🛡 {t.qsEssSafety}</a>
            <a href={`/${locale}/c/${city.id}#goodtoknow`} className="press">💡 {t.qsEssGood}</a>
          </div>
        </div>
      )}
    </section>
  );
}
