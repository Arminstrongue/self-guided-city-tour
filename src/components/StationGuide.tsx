"use client";
/**
 * Guia da estação: da bagagem até ao transporte — placas a seguir, elevadores, malas, escadas rolantes, bilhetes, plataformas.
 * Só mostra o que foi verificado em fontes oficiais; aviso para seguir sempre as placas no local.
 */
import { useState } from "react";
import { ArrowUpDown, ChevronDown, Footprints, Luggage, MoveVertical, Signpost, Ticket, TrainFront } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { guideFor, type GuideField } from "@/data/arrival-guides";
import { useGuideTx } from "@/lib/guide-text";

const ICON: Record<GuideField, typeof Footprints> = { fromBaggage: Footprints, follow: Signpost, lift: ArrowUpDown, luggage: Luggage, escalator: MoveVertical, tickets: Ticket, platforms: TrainFront };

export function StationGuide({ t, locale, optionId, open: openInit = true }: { t: Dict; locale: Locale; optionId: string; open?: boolean }) {
  const g = guideFor(optionId);
  const tx = useGuideTx(locale);
  const [open, setOpen] = useState(openInit);
  if (!g) return null;
  const rows = (["fromBaggage", "lift", "luggage", "escalator", "tickets", "platforms"] as const).filter((k) => g[k]);
  if (!rows.length && !g.follow) return null;
  const label: Record<GuideField, string> = { fromBaggage: t.stgFromBag, follow: t.stgFollow, lift: t.stgLift, luggage: t.stgLuggage, escalator: t.stgEscalator, tickets: t.stgTickets, platforms: t.stgPlatforms };
  const month = (() => { try { return new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", year: "numeric" }).format(new Date(`${g.checked}-15`)); } catch { return g.checked; } })();
  return (
    <section className="sg">
      <button type="button" className="sg-h press" aria-expanded={open} onClick={() => setOpen(!open)}>
        <b>{t.stgTitle}</b>
        {g.walkMin ? <small>{fmt(t.stgWalk, { m: g.walkMin })}</small> : null}
        <ChevronDown size={18} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : undefined }} />
      </button>
      {open && (
        <div className="sg-b">
          {g.follow && (
            <div className="sg-follow">
              <span className="sg-sign" style={g.follow.color ? { boxShadow: `inset 6px 0 0 ${g.follow.color}` } : undefined}>{g.follow.label}</span>
              <p>{tx(`${optionId}.follow`, g.follow)}</p>
            </div>
          )}
          {g.photo && (
            <figure className="sg-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.photo.image} alt={g.follow?.label ?? t.stgTitle} loading="lazy" decoding="async" />
              <figcaption>{g.photo.license ? <><a href={g.photo.page} target="_blank" rel="noopener noreferrer">{g.photo.author}</a> · {g.photo.license} · Wikimedia Commons</> : g.photo.author}</figcaption>
            </figure>
          )}
          <ul className="sg-rows">
            {rows.map((k) => { const I = ICON[k]; return (
              <li key={k}><I size={18} aria-hidden="true" /><span><b>{label[k]}</b><span>{tx(`${optionId}.${k}`, g[k]!)}</span></span></li>
            ); })}
          </ul>
          <p className="sg-note">{fmt(t.stgChecked, { d: month })}{g.sources.length ? <> · {g.sources.slice(0, 3).map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer">{t.stgSource} {i + 1}</a>).reduce<React.ReactNode[]>((a, x, i) => (i ? [...a, " ", x] : [x]), [])}</> : null}</p>
        </div>
      )}
    </section>
  );
}
