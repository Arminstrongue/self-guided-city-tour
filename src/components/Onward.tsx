"use client";
/** Seguir viagem: próxima cidade (no plano), "Seguir para X" no fim do roteiro e cidades perto (ida e volta no dia). */
import { useMemo } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { NextCity } from "@/lib/trip";
import { citiesByDistance, groundLink, hoursLabel, kmBetween, nearbyCities, travelEstimate, type CityPoint } from "@/lib/nearby";
import { SearchPick } from "./SearchPick";
import { useDict } from "@/i18n/client-dict";

type From = { id: string; name: string; lat: number; lng: number };

export function NextCityPick({ t, locale, from, cities, value, onChange }: { t: Dict; locale: Locale; from: From; cities: CityPoint[]; value?: NextCity; onChange: (n: NextCity | undefined) => void }) {
  const opts = useMemo(() => citiesByDistance(cities, from).map((c) => ({ value: c.id, label: c.name, icon: "📍", sub: `${new Intl.NumberFormat(INTL_LOCALE[locale]).format(c.km)} km` })), [cities, from, locale]);
  return (
    <div className="nxc">
      <SearchPick options={opts} value={value ? value.city ?? value.name : null} free max={40}
        label={t.nxcT} placeholder={t.nxcPh}
        onChange={(v, label) => {
          if (!v) return onChange(undefined);
          const hit = cities.find((c) => c.id === v);
          onChange(hit ? { city: hit.id, name: hit.name } : { name: String(label ?? v).slice(0, 60) });
        }} />
      <p className="hint">{t.nxcHint}</p>
    </div>
  );
}

const howTxt = (t: Dict, how: "ground" | "plane") => (how === "plane" ? t.nbPlane : t.nbGround);

/** Cartão no fim do roteiro (e no plano): leva ao roteiro da próxima cidade. */
export function OnwardLink({ t, locale, from, cities, next }: { t: Dict; locale: Locale; from: From; cities: CityPoint[]; next?: NextCity }) {
  if (!next) return null;
  const c = next.city ? cities.find((x) => x.id === next.city) : undefined;
  if (!c) return <p className="hint nxc-bye">✈ {fmt(t.nxcNoGuide, { c: next.name })}</p>;
  const k = Math.round(kmBetween(from, c)); const e = travelEstimate(k, groundLink(from.id, c.id));
  return (
    <a className="nxc-go press" href={`/${locale}/c/${c.id}`}>
      <span><b>{fmt(t.nxcGo, { c: c.name })}</b><small>{fmt(t.nxcGoSub, { k: new Intl.NumberFormat(INTL_LOCALE[locale]).format(k), h: hoursLabel(e.min), how: howTxt(t, e.how) })}</small></span>
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

/** Lista de cidades VOYBU perto, com distância e tempo estimado. */
export function NearbyCities({ t: tProp, locale, from, cities, max = 6 }: { t?: Dict; locale: Locale; from: From; cities: CityPoint[]; max?: number }) {
  const t = useDict(tProp);
  const list = useMemo(() => nearbyCities(cities, from, 900, max), [cities, from, max]);
  if (!list.length) return null;
  return (
    <section className="card nb" aria-label={fmt(t.nbT, { c: from.name })}>
      <h3>{fmt(t.nbT, { c: from.name })}</h3>
      <p className="hint">{t.nbSub}</p>
      <ul>
        {list.map((n) => (
          <li key={n.id}><a className="nb-row press" href={`/${locale}/c/${n.id}`}>
            <MapPin size={16} aria-hidden="true" />
            <span><b>{n.name}</b><small>{new Intl.NumberFormat(INTL_LOCALE[locale]).format(n.km)} km · {hoursLabel(n.min)} {howTxt(t, n.how)}</small></span>
            {n.dayTrip && <em className="nb-day">{t.nbDay}</em>}
          </a></li>
        ))}
      </ul>
    </section>
  );
}
