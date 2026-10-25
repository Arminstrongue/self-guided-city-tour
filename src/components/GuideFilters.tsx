"use client";
/** Filtros da lista de guias (idioma, preço por hora, avaliação): ficam no endereço, para partilhar e voltar atrás. */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X as XIcon } from "lucide-react";
import type { Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { useDict } from "@/i18n/client-dict";
import { FilterSheet, type FSection } from "./FilterSheet";

export function GuideFilters({ locale, langs, count }: { locale: Locale; langs: { code: string; name: string }[]; count: number }) {
  const t = useDict();
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const read = (): Record<string, string[]> => ({ lang: sp.getAll("lang"), max: sp.getAll("max").slice(0, 1), rating: sp.getAll("rating").slice(0, 1) });
  const [v, setV] = useState(read);
  const [open, setOpen] = useState(false);
  const eur = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const sections: FSection[] = [
    { key: "lang", title: t.fl.language, options: langs.map((l) => ({ value: l.code, label: l.name })) },
    { key: "max", title: t.fl.price, multi: false, options: [30, 50, 80].map((p) => ({ value: String(p), label: fmt(t.fl.priceMax, { p: eur(p) }) })) },
    { key: "rating", title: t.fl.rating, multi: false, options: ["4", "4.5"].map((r) => ({ value: r, label: `★ ${r}+` })) }
  ];
  const apply = (next: Record<string, string[]>) => {
    const q = new URLSearchParams();
    for (const [k, vs] of Object.entries(next)) for (const x of vs) q.append(k, x);
    router.replace(`${path}${q.toString() ? `?${q}` : ""}`, { scroll: false });
  };
  const active = Object.entries(read()).flatMap(([k, vs]) => vs.map((x) => ({ k, x, label: sections.find((s) => s.key === k)?.options.find((o) => o.value === x)?.label ?? x })));
  const chips = active.map((a) => <button key={a.k + a.x} type="button" className="flt-chip" onClick={() => { const n = { ...read(), [a.k]: read()[a.k].filter((y) => y !== a.x) }; setV(n); apply(n); }}>{a.label} <XIcon size={14} aria-hidden="true" /></button>);
  return (
    <>
      <div className="flt-bar">
        <button type="button" className={`flt-btn${active.length ? " on" : ""}`} onClick={() => { setV(read()); setOpen(true); }} aria-haspopup="dialog"><SlidersHorizontal size={16} aria-hidden="true" />{t.fl.title}{active.length ? <i>{active.length}</i> : null}</button>
        {chips}
      </div>
      {open && <FilterSheet title={t.fl.title} sections={sections} value={v} onChange={(k, x) => setV({ ...v, [k]: x })} onReset={() => setV({})}
        onClose={() => { setOpen(false); apply(v); }} showLabel={fmt(t.fl.show, { n: count })} resetLabel={t.fl.reset} closeLabel={t.close} />}
    </>
  );
}
