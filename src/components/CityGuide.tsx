"use client";
/** Guia prático da cidade (separador "Guia"): carrega só quando é aberto. */
import { useEffect, useState } from "react";
import { emergencyText } from "@/data/practical";
import type { City } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { PRACTICAL } from "@/data/practical";
import { ExitCheck, NAT_KEY } from "./ExitCheck";
import { ExtLink } from "./ExtLink";
import { COUNTRY_CODES } from "@/data/countries";

export function CityGuide({ city, cityLabel, t, locale, money }: {
  city: City; cityLabel: string; t: Dict; locale: Locale; money: (v: number) => React.ReactNode;
}) {
  const g = PRACTICAL[city.id];
  const [nat, setNat] = useState("");
  useEffect(() => { try { setNat(localStorage.getItem(NAT_KEY) ?? ""); } catch { /* ignorar */ } }, []);
  const tx = (o: { pt: string; en: string }) => (locale === "pt" ? o.pt : o.en);
  let natName = "";
  let natLocal = "";
  try {
    natName = nat ? new Intl.DisplayNames(["en"], { type: "region" }).of(nat) ?? "" : "";
    natLocal = nat ? new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }).of(nat) ?? "" : "";
  } catch { /* ignorar */ }
  const c = city.stops[0];
  const natList = (() => { try { const dn = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }); return COUNTRY_CODES.map((x) => ({ c: x, n: dn.of(x) ?? x })).sort((a, b) => a.n.localeCompare(b.n)); } catch { return COUNTRY_CODES.map((x) => ({ c: x, n: x })); } })();
  const embassy = `https://www.google.com/maps/search/${encodeURIComponent(`embassy of ${natName} ${cityLabel}`)}/@${c.lat},${c.lng},13z`;
  return (
    <div className="stack">
      <h2 style={{ fontSize: 22 }}>{fmt(t.guideTitle, { city: cityLabel })}</h2>
      <div className="card rows" style={{ paddingBlock: 6 }}>
        {g && <div><span>🚨 {t.emergency}</span><a className="num" href={`tel:${g.emergency.split(" ")[0]}`}><b>{emergencyText(g.emergency, t)}</b></a></div>}
        {city.ap && <div><span>✈ {t.airportLbl}</span><span>{city.ap.iata} · {city.ap.name}</span></div>}
        {/* Embaixada: com nacionalidade, procura a do país do viajante; sem ela, pede-a (nunca uma pesquisa genérica com rótulo enganador). */}
        {nat ? <div className="stack" style={{ gap: 2, alignItems: "stretch" }}>
            <div><span>🏛 {fmt(t.emb.of, { c: natLocal })}</span><ExtLink href={embassy}>Google Maps ↗</ExtLink></div>
            <small className="hint">{t.emb.note} <button type="button" className="link-btn" onClick={() => { setNat(""); try { localStorage.removeItem(NAT_KEY); } catch { /* ignorar */ } }}>{t.bpChange}</button></small>
          </div>
          : <div className="stack" style={{ gap: 6, alignItems: "stretch" }}>
            <label htmlFor="emb-nat" className="hint">🏛 {t.emb.pick}</label>
            <select id="emb-nat" value="" onChange={(e) => { setNat(e.target.value); try { localStorage.setItem(NAT_KEY, e.target.value); } catch { /* ignorar */ } }}>
              <option value="">—</option>
              {natList.map((x) => <option key={x.c} value={x.c}>{x.n}</option>)}
            </select>
          </div>}
      </div>
      {g && (
        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          {g.tips.map((tip, i) => (
            <div key={i}><span className="label">{(t.tipK as Record<string, string>)[tip.k]}</span><p>{tx(tip)}</p></div>
          ))}
        </div>
      )}
      {g && (
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          <b>🍽 {t.eatTitle}</b>
          {g.food.map((f) => (
            <div key={f.n} className="row-between"><div><b>{f.n}</b><p className="hint">{tx(f)}</p></div><span className="num">~{money(f.p)}</span></div>
          ))}
          <p className="hint">{t.eatNote}</p>
        </div>
      )}
      <ExitCheck city={city} locale={locale} t={t} compact />
    </div>
  );
}

