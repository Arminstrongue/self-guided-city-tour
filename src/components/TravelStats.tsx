"use client";
/** "As minhas viagens" no perfil: continentes, km e passos a pé, próxima viagem e estilo de viagem. */
import { useEffect, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { TravelPrefs } from "@/lib/db/schema";
import { continentsCount } from "@/lib/continents";
import { CalendarDays, ChevronRight, Earth, Footprints, Route } from "lucide-react";

type Plan = { id: string; title: string; cityName: string; startDate: string | null; days: number };

export function TravelStats({ t, locale, world, plans, travel, onEdit }: { t: Dict; locale: Locale; world: { cities: number; countries: number; ccs: string[] }; plans: Plan[]; travel: TravelPrefs; onEdit: () => void }) {
  const s = t.trv.st;
  const [walk, setWalk] = useState<{ km: number; steps: number; n: number } | null>(null);
  useEffect(() => {
    fetch("/api/me/journeys", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j: { list?: { km: number; steps: number }[] } | null) => {
      const l = j?.list ?? []; setWalk({ km: l.reduce((a, x) => a + (Number(x.km) || 0), 0), steps: l.reduce((a, x) => a + (Number(x.steps) || 0), 0), n: l.length });
    }).catch(() => setWalk({ km: 0, steps: 0, n: 0 }));
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const next = plans.filter((p) => p.startDate && p.startDate >= today).sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];
  const nf = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 1 });
  const df = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short" });
  const style = [...(travel.types ?? []).map((k) => t.trv.types[k]), ...(travel.pace && travel.pace !== "balanced" ? [t.trv.paces[travel.pace]] : [])];
  return (
    <section className="tst">
      <div className="tst-h"><b>✈️ {s.title}</b></div>
      <div className="tst-grid">
        {/* Cidades e países já estão no topo do perfil: aqui só o que não aparece noutro lado. */}
        <div><Earth size={16} aria-hidden="true" /><b className="num">{continentsCount(world.ccs)}</b><small>{s.continents}</small></div>
        <div><Footprints size={16} aria-hidden="true" /><b className="num">{walk ? nf.format(walk.km) : "—"}</b><small>{s.km}</small></div>
        <div><Footprints size={16} aria-hidden="true" /><b className="num">{walk ? nf.format(walk.steps) : "—"}</b><small>{s.steps}</small></div>
        <div><Route size={16} aria-hidden="true" /><b className="num">{walk ? walk.n : "—"}</b><small>{s.walks}</small></div>
      </div>
      <a className="tst-next press" href={next ? `/${locale}/plan/${next.id}` : `/${locale}/plan/new`}>
        <CalendarDays size={18} aria-hidden="true" />
        <span><small>{s.next}</small><b>{next ? `${next.cityName} · ${df.format(new Date(`${next.startDate}T12:00:00`))}${next.days > 1 ? ` · ${fmt(t.plDaysN, { n: next.days })}` : ""}` : s.noNext}</b>{!next && <em>{s.plan} →</em>}</span>
        <ChevronRight size={18} aria-hidden="true" />
      </a>
      <button type="button" className="tst-style press" onClick={onEdit}>
        <span><small>{s.style}</small><b className={style.length ? "" : "tst-empty"}>{style.length ? style.join(" · ") : s.pick}</b></span><em>{style.length ? s.edit : <ChevronRight size={18} aria-hidden="true" />}</em>
      </button>
    </section>
  );
}
