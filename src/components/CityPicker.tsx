"use client";
import { useEffect, useState } from "react";

export type CityGroup = { label: string; cities: { id: string; name: string; stops: number }[] };

/** Escolha da cidade numa caixa de seleção agrupada por país (mais limpa no telemóvel do que uma grelha). */
export function CityPicker({ locale, groups, soon, labels }: {
  locale: string; groups: CityGroup[]; soon: string[];
  labels: { choose: string; stops: string; start: string; soon: string };
}) {
  const first = groups[0]?.cities[0]?.id ?? "";
  const [city, setCity] = useState(first);
  // Lembra a última cidade escolhida neste dispositivo.
  useEffect(() => {
    try { const s = localStorage.getItem("sgct:city"); if (s && groups.some((g) => g.cities.some((c) => c.id === s))) setCity(s); } catch { /* ignorar */ }
  }, [groups]);
  const go = () => { try { localStorage.setItem("sgct:city", city); } catch { /* ignorar */ } window.location.href = `/${locale}/c/${city}`; };
  const total = groups.reduce((a, g) => a + g.cities.length, 0);
  return (
    <form className="card stack city-picker" style={{ gap: 12 }} onSubmit={(e) => { e.preventDefault(); go(); }}>
      <label htmlFor="city-sel" className="label">{labels.choose} <span className="num">({total})</span></label>
      <div className="select-wrap">
        <select id="city-sel" value={city} onChange={(e) => setCity(e.target.value)}>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.cities.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.stops} {labels.stops}</option>)}
            </optgroup>
          ))}
          {soon.length > 0 && (
            <optgroup label={labels.soon}>
              {soon.map((n) => <option key={n} disabled>{n}</option>)}
            </optgroup>
          )}
        </select>
      </div>
      <button className="btn tram" type="submit">{labels.start} →</button>
    </form>
  );
}
