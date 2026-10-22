"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Clock, MapPin, Play, Search } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

export type QsOption = { key: string; n: number; min: number; cost: string; names: string[] };
export type QsCity = { id: string; name: string; country: string; flag: string; open: boolean; options: QsOption[] };

/** Margem antes da partida (igual à do roteiro: chegar ao aeroporto com tempo). */
const BUFFER_MIN = 150;
type Time = { k: string; min: number };
const fold = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hrs = (m: number) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, "0")}`;

/** Primeira experiência: 1) cidade, 2) tempo disponível, 3) começar (ou comprar) com o roteiro que cabe. */
export function QuickStart({ t, locale, cities, pre, from }: { t: Dict; locale: Locale; cities: QsCity[]; pre: string; from: string }) {
  const [cityId, setCityId] = useState(pre);
  const [time, setTime] = useState<Time | null>(null);
  const [dep, setDep] = useState("");
  const [q, setQ] = useState("");
  const [shift, setShift] = useState(0); // "mais curto / mais longo" a partir do que cabe
  const step = !cityId ? 1 : !time ? 2 : 3;
  const city = cities.find((c) => c.id === cityId) ?? null;

  const list = useMemo(() => { const f = fold(q.trim()); return f ? cities.filter((c) => fold(`${c.name} ${c.country}`).includes(f)) : cities; }, [q, cities]);
  const TIMES: { k: string; label: string; min: number }[] = [
    { k: "3h", label: t.qsT3, min: 180 }, { k: "5h", label: t.qsT5, min: 300 }, { k: "day", label: t.qsDay, min: 480 }, { k: "wk", label: t.qsWeekend, min: Infinity }
  ];

  const fitIdx = useMemo(() => {
    if (!city || !time) return -1;
    let best = -1;
    city.options.forEach((o, i) => { if (o.min <= time.min) best = i; });
    return best;
  }, [city, time]);
  const idx = city && fitIdx >= 0 ? Math.max(0, Math.min(city.options.length - 1, fitIdx + shift)) : -1;
  const opt = city && idx >= 0 ? city.options[idx] : null;

  function go() {
    if (!city || !opt) return;
    try { localStorage.setItem(`sgct:lvl:${city.id}`, JSON.stringify(opt.key)); localStorage.setItem("sgct:onboarded", "1"); } catch { /* sem armazenamento */ }
    if (city.open) { location.href = `/${locale}/tour/${city.id}`; return; }
    const d = time?.k === "dep" && dep ? `?dep=${encodeURIComponent(dep)}` : "";
    location.href = `/${locale}/c/${city.id}${d}#book`;
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
              <button key={c.id} className="qs-city press" onClick={() => { setCityId(c.id); setQ(""); }}>
                <span className="qs-flag" aria-hidden="true">{c.flag}</span>
                <span className="qs-tx"><b>{c.name}</b><small>{c.country}</small></span>
                {c.open && <span className="qs-owned">{t.qsOpen}</span>}
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <div className="qs-times">
          {TIMES.map((x) => (
            <button key={x.k} className="qs-time press" onClick={() => setTime({ k: x.k, min: x.min })}><Clock size={18} aria-hidden="true" /><span>{x.label}</span><ChevronRight size={16} aria-hidden="true" /></button>
          ))}
          <div className="qs-time qs-dep">
            <span className="qs-dep-l"><Clock size={18} aria-hidden="true" />{t.qsUntil}</span>
            <input type="datetime-local" value={dep} onChange={(e) => setDep(e.target.value)} aria-label={t.qsUntil} />
            <button className="btn tram" disabled={!dep} onClick={() => setTime({ k: "dep", min: Math.round((new Date(dep).getTime() - Date.now()) / 60000) - BUFFER_MIN })}>{t.qsNext}</button>
            <small className="hint">{t.qsUntilHint}</small>
          </div>
        </div>
      )}

      {step === 3 && city && (
        <div className="qs-result">
          {opt ? (
            <>
              <div className="qs-sum">
                <b>{city.flag} {city.name}</b>
                <span>{fmt(t.qsFits, { n: opt.n, h: hrs(opt.min), c: opt.cost })}</span>
              </div>
              <ol className="qs-stops">{opt.names.map((n, i) => <li key={n + i}><span className="num">{i + 1}</span>{n}</li>)}</ol>
              <div className="qs-adj">
                <button className="link-btn" disabled={idx <= 0} onClick={() => setShift(shift - 1)}>− {t.qsShorter}</button>
                <button className="link-btn" disabled={idx >= city.options.length - 1} onClick={() => setShift(shift + 1)}>{t.qsLonger} +</button>
              </div>
              <button className="btn tram qs-go press" onClick={go}><Play size={18} aria-hidden="true" />{city.open ? t.qsStart : fmt(t.qsBuy, { p: from })}</button>
            </>
          ) : (
            <p className="fit bad">{fmt(t.qsNone, { h: hrs(city.options[0]?.min ?? 0) })}</p>
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
