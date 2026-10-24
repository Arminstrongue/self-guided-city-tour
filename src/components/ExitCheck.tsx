"use client";
import { useDict } from "@/i18n/client-dict";
import { useEffect, useState } from "react";
import type { City } from "@/data/cities";
import { ZONE_COUNTRY, zoneOf } from "@/data/city-meta";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { ExtLink } from "./ExtLink";
import { checkLayover, ENTRY_CHECKED, ETIAS_LIVE, NATIONALITIES, type EntryVerdict } from "@/lib/entry";
import { cityNowLocal } from "@/lib/trip";
import { zonedToDate } from "@/lib/zoned";
import { loadTrip, saveTrip } from "./trip-store";

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

export const NAT_KEY = "sgct:nat";

/**
 * "Posso sair do aeroporto?": ferramenta opcional para quem viaja de avião. A hora de partida é a MESMA do plano
 * de viagem (planeador e compra), na hora local da cidade.
 */
export function ExitCheck({ city, locale, t: tProp, compact = false, onlyPlane = false }: { city: City; locale: Locale; t?: Dict; compact?: boolean; onlyPlane?: boolean }) {
  const t = useDict(tProp);
  const tz = city.tz ?? "UTC";
  const [isPlane, setIsPlane] = useState(true);
  const [nat, setNat] = useState("");
  const [arr, setArr] = useState("");
  const [dep, setDep] = useState("");
  const [permit, setPermit] = useState(false);
  const [open, setOpen] = useState(!compact);

  useEffect(() => {
    let n = "";
    try { n = localStorage.getItem(NAT_KEY) ?? ""; } catch { /* sem armazenamento */ }
    setNat(n); // sem predefinição: o resultado só aparece depois de o viajante escolher
    const sync = () => { const tr = loadTrip(city.id); setIsPlane(tr.mode === "plane"); setDep(tr.deadline || cityNowLocal(tz, 8 * 60)); };
    setArr(cityNowLocal(tz)); sync();
    const on = (e: Event) => { if ((e as CustomEvent).detail === city.id) sync(); };
    window.addEventListener("sgct:trip", on);
    return () => window.removeEventListener("sgct:trip", on);
  }, [city.id, tz]);

  // Nomes dos países só no navegador (o servidor e o navegador podem traduzir de forma diferente).
  const [names, setNames] = useState<{ c: string; n: string }[]>([]);
  useEffect(() => {
    let dn: Intl.DisplayNames | null = null;
    try { dn = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }); } catch { /* navegador antigo */ }
    setNames(NATIONALITIES.map((c) => ({ c, n: dn?.of(c) ?? c })).sort((a, b) => a.n.localeCompare(b.n, INTL_LOCALE[locale])));
  }, [locale]);

  const a = arr ? zonedToDate(arr, tz) : null, d = dep ? zonedToDate(dep, tz) : null;
  const timesOk = a && d && !isNaN(a.getTime()) && !isNaN(d.getTime()) && d > a;
  const res = nat && timesOk ? checkLayover(city, nat, a!, d!, permit) : null;

  function save(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignorar */ } }

  const msg: Record<EntryVerdict, string> = {
    free: t.vFree, "free-ees": t.vFreeEes, etias: t.vEtias, eta: t.vEta, evisa: t.vEvisa, visa: t.vVisa, unknown: t.vUnknown,
    "free-pass": t.vFreePass, voa: t.vVoa, "evisa-me": t.vEvisaMe, auth: t.vAuth
  };
  const tone = (v: EntryVerdict) => (v === "visa" ? "bad" : v === "unknown" || v === "eta" || v === "etias" || v === "evisa" || v === "evisa-me" || v === "voa" ? "warn" : "ok");
  const zone = zoneOf(city);
  const zc = ZONE_COUNTRY[zone];
  const zoneName = zone === "uk" ? t.zoneUK : zone === "tr" ? t.zoneTR : zone === "schengen" ? t.zoneSchengen : zone === "sg" ? t.zoneSG
    : zc ? (() => { try { return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }).of(zc) ?? zc; } catch { return zc; } })()
      : t.zoneMe[zone as keyof Dict["zoneMe"]];

  if (onlyPlane && !isPlane) return null;
  if (!open) return <button type="button" className="btn ghost" onClick={() => setOpen(true)}>{t.exitTitle} · {t.tpOptional}</button>;

  return (
    <section className="card stack exit-check" style={{ gap: 10, padding: 14 }}>
      <div><b>{t.exitTitle}</b><p className="hint">{t.exitSub}</p><p className="hint">{fmt(t.tpCityTime, { c: (city.n as Record<string, string>)[locale] ?? city.n.en })}</p></div>
      <div className="field"><label htmlFor="nat">{t.nationality}</label>
        <select id="nat" value={nat} onChange={(e) => { setNat(e.target.value); save(NAT_KEY, e.target.value); }}>
          <option value="">—</option>
          {names.map((x) => <option key={x.c} value={x.c}>{x.n}</option>)}
        </select></div>
      <div className="grid2">
        <div className="field"><label htmlFor="arr">{t.arrival}</label>
          <input id="arr" type="datetime-local" value={arr} onChange={(e) => setArr(e.target.value)} /></div>
        <div className="field"><label htmlFor="dep2">{t.departure}</label>
          <input id="dep2" type="datetime-local" value={dep} onChange={(e) => { setDep(e.target.value); saveTrip(city.id, { ...loadTrip(city.id), mode: "plane", end: { kind: "airport" }, deadline: e.target.value }); }} /></div>
      </div>
      <label className="consent"><input type="checkbox" checked={permit} onChange={(e) => setPermit(e.target.checked)} /> <span>{fmt(t.hasPermit, { zone: zoneName })}</span></label>
      {!timesOk && arr && dep && <p className="err">{t.errTimes}</p>}
      {res && (
        <div className={`verdict-box ${tone(res.entry.verdict)}`} role="status">
          <p><b>{fmt(msg[res.entry.verdict], { fee: res.entry.fee ?? "", site: res.entry.site ?? "", zone: zoneName })}</b></p>
          {res.entry.hint && <p className="hint">{res.entry.hint === "sg-arrival" ? t.entryHintSg : res.entry.hint in t.entryHint ? t.entryHint[res.entry.hint as keyof Dict["entryHint"]] : t.entryHint2[res.entry.hint as keyof Dict["entryHint2"]]}</p>}
          {res.entry.zone === "schengen" && !ETIAS_LIVE && res.entry.verdict === "free-ees" && !permit && <p className="hint">{t.etiasSoon}</p>}
          {res.entry.transitVisa && <p className="hint">{t.atv}</p>}
          {res.entry.verdict !== "visa" && (
            <>
              <p>{fmt(t.layover, { h: hrs(res.layoverMin), c: hrs(Math.max(0, res.cityMin)) })}</p>
              <p><b>{res.route ? fmt(t.fits, { n: res.route.plan.stops.length, h: hrs(res.route.plan.minutesTotal) }) : t.noFit}</b></p>
              <p className="hint">{fmt(t.exitNote, { m: res.entry.exitMin })}</p>
            </>
          )}
          <p className="hint"><ExtLink href={res.entry.officialUrl}>{t.official}</ExtLink> · {t.disclaimer}</p>
          <p className="hint">{fmt(t.enChecked, { d: new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", year: "numeric" }).format(new Date(`${ENTRY_CHECKED}-15`)) })}</p>
        </div>
      )}
    </section>
  );
}
