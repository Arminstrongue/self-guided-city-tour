"use client";
/** Atrações de topo por país: um país de cada vez (lista para escolher + os mais procurados à mão), numeradas por popularidade. */
import { useState } from "react";
import Link from "next/link";

export type TopCountry = { cc: string; name: string; flag: string; items: { city: string; cityName: string; id: string; name: string }[] };

export function TopByCountry({ locale, countries, label, countTpl, moreLabel }: { locale: string; countries: TopCountry[]; label: string; countTpl: string; moreLabel: string }) {
  const [cc, setCc] = useState(countries[0]?.cc ?? "");
  const [all, setAll] = useState(false);
  const cur = countries.find((c) => c.cc === cc) ?? countries[0];
  if (!cur) return null;
  const quick = countries.slice(0, 6);
  return (
    <div className="tbc">
      <div className="tbc-bar">
        <div className="tbc-quick" role="tablist" aria-label={label}>
          {quick.map((c) => (
            <button key={c.cc} type="button" role="tab" aria-selected={c.cc === cur.cc} className={c.cc === cur.cc ? "on" : ""} onClick={() => { setCc(c.cc); setAll(false); }}>
              <span aria-hidden="true">{c.flag}</span>{c.name}
            </button>
          ))}
        </div>
        <label className="tbc-sel">
          <span className="sr-only">{label}</span>
          <select value={cur.cc} onChange={(e) => { setCc(e.target.value); setAll(false); }} aria-label={label}>
            {countries.map((c) => <option key={c.cc} value={c.cc}>{c.flag} {c.name} · {countTpl.replace("{n}", String(c.items.length))}</option>)}
          </select>
        </label>
      </div>
      <ol className="tc-ol tbc-list">
        {cur.items.slice(0, all ? 12 : 5).map((s, k) => (
          <li key={s.city + s.id}><Link href={`/${locale}/c/${s.city}`} className="press"><i>{k + 1}</i><span><b>{s.name}</b><small>{s.cityName}</small></span></Link></li>
        ))}
      </ol>
      {!all && cur.items.length > 5 && <button type="button" className="link-btn tbc-more" onClick={() => setAll(true)}>{moreLabel} ({Math.min(12, cur.items.length) - 5})</button>}
    </div>
  );
}
