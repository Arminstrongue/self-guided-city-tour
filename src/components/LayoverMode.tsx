"use client";
/** VOYBU Layover · Modo Escala: aeroporto, tempo de escala, interesses e bagagem → plano com tempos reais. */
import { useEffect, useMemo, useState } from "react";
import { useDict } from "@/i18n/client-dict";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { BUCKETS, layoverPlan, type LyOption } from "@/lib/layover";
import { AIRPORT, cityNowLocal, defaultTrip } from "@/lib/trip";
import { saveTrip } from "./trip-store";
import { Plane, Luggage, Clock, MapPin, ArrowRight, Footprints, TrainFront, ShieldCheck, Check } from "lucide-react";

type CityIn = { id: string; name: string; iata: string; tz: string; airMin: number; airLine: string; options: (LyOption & { names: string[] })[] };
type Like = "sights" | "shopping" | "nature" | "rest" | "budget";
const LIKE_G: Record<Like, string> = { sights: "sights,food,art", shopping: "shopping,leisure", nature: "nature", rest: "leisure", budget: "leisure,sights" };
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}` : ""}` : `${m} min`);

export function LayoverMode({ t: tProp, locale, cities, city }: { t?: Dict; locale: Locale; cities: { id: string; name: string; iata: string }[]; city: CityIn | null }) {
  const t = useDict(tProp);
  const l = t.ly;
  const [hours, setHours] = useState(6);
  const [other, setOther] = useState(false);
  const [likes, setLikes] = useState<Like[]>(["sights"]);
  const [bag, setBag] = useState<"with" | "through" | "stored">("through");
  const [shown, setShown] = useState(false);
  useEffect(() => { try { const h = Number(new URLSearchParams(location.search).get("h")); if (h >= 2 && h <= 24) { setHours(h); setOther(!BUCKETS.includes(h as 3)); } } catch { /* ignorar */ } }, []);
  const plan = useMemo(() => (city ? layoverPlan(hours, city.airMin, city.options) : null), [city, hours]);
  const opt = plan?.option ? city!.options.find((o) => o.key === plan.option!.key)! : null;
  const toggle = (k: Like) => setLikes((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));
  const bucketOf = (h: number) => [...BUCKETS].reverse().find((b) => h >= b) ?? 3;

  function startRoute() {
    if (!city) return;
    // Partida = agora + tempo de escala, no fuso da cidade; início e fim no aeroporto, com a margem do avião.
    saveTrip(city.id, { ...defaultTrip(), start: AIRPORT, end: AIRPORT, mode: "plane", startAt: "", deadline: cityNowLocal(city.tz, hours * 60), key: opt?.key });
    window.location.href = `/${locale}/start?city=${city.id}`;
  }
  const g = [...new Set(likes.flatMap((k) => LIKE_G[k].split(",")))].join(",");

  return (
    <section className="ly stack">
      <div>
        <span className="eyebrow"><Plane size={14} aria-hidden="true" /> {l.eyebrow}</span>
        <h1 className="dp-h">{l.title}</h1>
        <p className="hint">{l.sub}</p>
      </div>

      <div className="card dp-card stack">
        <label className="field"><span className="bp-h"><MapPin size={14} aria-hidden="true" /> {l.airport}</span>
          <select value={city?.id ?? ""} onChange={(e) => { window.location.href = `/${locale}/layover?city=${e.target.value}&h=${hours}`; }}>
            {!city && <option value="">{l.pick}</option>}
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.iata})</option>)}
          </select>
        </label>

        <span className="bp-h"><Clock size={14} aria-hidden="true" /> {l.hours}</span>
        <div className="ly-buckets" role="radiogroup" aria-label={l.hours}>
          {BUCKETS.map((b) => (
            <button key={b} type="button" role="radio" aria-checked={!other && hours === b} className={`ly-b press ${!other && hours === b ? "on" : ""}`} onClick={() => { setHours(b); setOther(false); }}>
              <b className="num">{b === 12 ? "12 h +" : fmt(l.hoursN, { n: String(b) })}</b><small>{l.bucket[String(b) as "3"]}</small>
            </button>
          ))}
          <label className={`ly-b ly-other ${other ? "on" : ""}`}>
            <b>{l.other}</b>
            <select value={other ? hours : ""} onChange={(e) => { setHours(Number(e.target.value)); setOther(true); }} aria-label={l.other}>
              <option value="" disabled>—</option>
              {Array.from({ length: 23 }, (_, i) => i + 2).map((h) => <option key={h} value={h}>{fmt(l.hoursN, { n: String(h) })}</option>)}
            </select>
          </label>
        </div>

        <span className="bp-h">{l.likes}</span>
        <div className="dp-groups">
          {(Object.keys(LIKE_G) as Like[]).map((k) => (
            <button key={k} type="button" aria-pressed={likes.includes(k)} className={`dp-g press ${likes.includes(k) ? "on" : ""}`} onClick={() => toggle(k)}>{l.like[k]}</button>
          ))}
        </div>

        <span className="bp-h"><Luggage size={14} aria-hidden="true" /> {l.bags}</span>
        <div className="ly-bags" role="radiogroup" aria-label={l.bags}>
          {(["with", "through", "stored"] as const).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={bag === k} className={`ly-bag press ${bag === k ? "on" : ""}`} onClick={() => setBag(k)}>{bag === k && <Check size={15} aria-hidden="true" />}{l.bag[k]}</button>
          ))}
        </div>

        <button className="btn tram press" disabled={!city} onClick={() => { setShown(true); requestAnimationFrame(() => document.getElementById("ly-res")?.scrollIntoView({ behavior: "smooth", block: "start" })); }}>
          {l.go}<ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      {shown && city && plan && (
        <div id="ly-res" className="ly-res stack" style={{ scrollMarginTop: 70 }}>
          <div className={`card ly-verdict ${plan.verdict}`}>
            <b>{plan.verdict === "stay" ? l.resStay : plan.verdict === "short" ? l.resShort : plan.verdict === "explore" ? l.resExplore : l.resLong}</b>
            {plan.verdict === "stay" ? <p>{fmt(l.resStaySub, { h: fmt(l.hoursN, { n: String(hours) }) })}</p>
              : <><p>{fmt(l.resRoute, { n: String(opt!.n), m: dur(opt!.tour) })}</p><ol className="qs-stops">{opt!.names.map((n, i) => <li key={n + i}><span className="num">{i + 1}</span>{n}</li>)}</ol></>}
            <small className="ly-bucket">{fmt(l.hoursN, { n: String(hours) })} · {l.bucket[String(bucketOf(hours)) as "3"]}</small>
          </div>

          <div className="card stack" style={{ gap: 8 }}>
            <b>{l.tl}</b>
            <ol className="ly-tl">
              <li><Plane size={16} aria-hidden="true" /><span>{l.tlLand}</span><b className="num">0:00</b></li>
              <li><ShieldCheck size={16} aria-hidden="true" /><span>{l.tlExit}</span><b className="num">≈ {dur(plan.exit)}</b></li>
              {plan.verdict !== "stay" && <>
                <li><TrainFront size={16} aria-hidden="true" /><span>{fmt(l.tlTo, { line: city.airLine || "—" })}</span><b className="num">≈ {dur(plan.to)}</b></li>
                <li className="hl"><Footprints size={16} aria-hidden="true" /><span>{l.tlTour}</span><b className="num">≈ {dur(plan.tour)}</b></li>
                {plan.free - plan.tour >= 15 && <li className="ly-extra"><Clock size={16} aria-hidden="true" /><span>{fmt(l.resFree, { m: dur(plan.free - plan.tour) })}</span><b /></li>}
                <li><TrainFront size={16} aria-hidden="true" /><span>{l.tlBack}</span><b className="num">≈ {dur(plan.back)}</b></li>
              </>}
              <li><Clock size={16} aria-hidden="true" /><span>{l.tlBuffer}</span><b className="num">{dur(plan.buffer)}</b></li>
              <li><Plane size={16} aria-hidden="true" style={{ transform: "rotate(45deg)" }} /><span>{l.tlDep}</span><b className="num">{fmt(l.hoursN, { n: String(hours) })}</b></li>
            </ol>
            <small className="hint">{l.est}</small>
          </div>

          {bag === "with" && <p className="ly-tip">🧳 {l.bagWith}</p>}
          {bag === "through" && <p className="ly-tip">✅ {l.bagThrough}</p>}
          {likes.includes("rest") && <p className="ly-tip">🛋 {l.restTip}</p>}
          {likes.includes("budget") && <p className="ly-tip">💸 {l.budgetTip}</p>}

          <div className="stack" style={{ gap: 8 }}>
            {plan.verdict !== "stay" && <button className="btn tram press" onClick={startRoute}>{l.start}<ArrowRight size={18} aria-hidden="true" /></button>}
            {plan.verdict !== "stay" && <a className="btn ghost press" href={`/${locale}/plan/new?city=${city.id}&days=1&g=${g}`}>{l.plan}</a>}
            <a className="btn ghost press" href="#exit">🛂 {l.exitT}</a>
          </div>
        </div>
      )}
    </section>
  );
}
