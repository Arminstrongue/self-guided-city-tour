"use client";
/** Página inicial: um só começo — escolher a cidade e seguir os 3 passos (cidade → tempo → roteiro). */
import { useMemo, useRef, useState } from "react";
import { useDict } from "@/i18n/client-dict";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { ArrowRight, Compass, MapPin } from "lucide-react";

type C = { id: string; name: string; country: string; flag: string };
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const HERO_EXP = ["sights", "food", "art", "nature", "night"] as const;

export function HeroSearch({ t: tProp, locale, cities }: { t?: Dict; locale: Locale; cities: C[] }) {
  const t = useDict(tProp);
  const h = t.hx;
  const [q, setQ] = useState("");
  const [city, setCity] = useState<C | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => {
    const w = fold(q.trim()).split(/\s+/).filter(Boolean);
    return (w.length ? cities.filter((c) => w.every((x) => fold(`${c.name} ${c.country}`).includes(x))) : cities).slice(0, 7);
  }, [q, cities]);
  const pick = (c: C) => { setCity(c); setQ(c.name); setOpen(false); };

  function go(e: React.FormEvent) {
    e.preventDefault();
    const c = city ?? (hits.length === 1 || (hits[0] && fold(hits[0].name) === fold(q.trim())) ? hits[0] : null);
    // Sem cidade escolhida: o passo 1 do planeador mostra a lista de cidades.
    if (c) try { localStorage.setItem("sgct:city", c.id); } catch { /* ignorar */ }
    window.location.href = `/${locale}/start${c ? `?city=${c.id}` : ""}`;
  }

  return (
    <form className="hs" onSubmit={go} role="search">
      <div className="hs-field hs-city">
        <MapPin size={18} aria-hidden="true" />
        <input ref={box} value={q} placeholder={h.cityPh} aria-label={h.cityPh} autoComplete="off"
          role="combobox" aria-expanded={open} aria-controls="hs-list"
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => { setQ(e.target.value); setCity(null); setOpen(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" && open && hits[0] && !city) { e.preventDefault(); pick(hits[0]); } }} />
        {open && hits.length > 0 && (
          <ul className="hs-list" id="hs-list" role="listbox">
            {hits.map((c) => <li key={c.id} role="option" aria-selected={city?.id === c.id}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)}><span aria-hidden="true">{c.flag}</span><b>{c.name}</b><small>{c.country}</small></button></li>)}
          </ul>
        )}
      </div>
      <ol className="hs-steps" aria-label={t.qsCta}>
        <li><b>1</b>{t.qs1}</li><li><b>2</b>{t.qsHowLong}</li><li><b>3</b>{t.qs3}</li>
      </ol>
      <button className="hs-go press" type="submit"><Compass size={18} aria-hidden="true" />{t.qsCta}<ArrowRight size={18} aria-hidden="true" /></button>
      <a className="hs-all" href="#cities">{h.all} →</a>
    </form>
  );
}
