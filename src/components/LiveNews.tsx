"use client";
/** Rodapé: notícias de segurança ao vivo da cidade aberta (ou de viagens e aeroportos), no idioma do viajante. */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { INTL_LOCALE, type Locale } from "@/i18n/dictionaries";

export type NewsStrings = { nwTitle: string; nwGeneral: string; nwOfficial: string; nwTrusted: string; nwNone: string; nwNote: string; nwMore: string };
import type { NewsItem } from "@/lib/news";

export function LiveNews({ t, locale, cities }: { t: NewsStrings; locale: Locale; cities: Record<string, string> }) {
  const path = usePathname() ?? "";
  const seg = path.split("/").filter(Boolean);
  const cand = ["c", "tour", "plan"].includes(seg[1] ?? "") ? seg[2] : seg[1];
  const city = cand && cities[cand] ? cand : null;
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [all, setAll] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () => fetch(`/api/news?locale=${locale}${city ? `&city=${city}` : ""}`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive) setItems(j?.items ?? []); }).catch(() => { if (alive) setItems([]); });
    setItems(null); void load();
    const id = setInterval(load, 10 * 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [city, locale]);
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto", style: "short" });
  const ago = (at: number) => { const m = Math.round((at - Date.now()) / 60_000); return Math.abs(m) < 60 ? rtf.format(m, "minute") : Math.abs(m) < 2880 ? rtf.format(Math.round(m / 60), "hour") : rtf.format(Math.round(m / 1440), "day"); };
  if (items === null) return <section className="nw" aria-busy="true"><div className="nw-h"><span className="nw-live">● LIVE</span><b>{t.nwTitle}</b></div><div className="nw-skel" /><div className="nw-skel" /></section>;
  const shown = all ? items : items.slice(0, 3);
  return (
    <section className="nw" aria-live="polite">
      <div className="nw-h"><span className="nw-live">● LIVE</span><b>{t.nwTitle}</b><span className="nw-where">🛡 {city ? cities[city] : t.nwGeneral}</span></div>
      {items.length === 0 && <p className="nw-none">✓ {t.nwNone}</p>}
      <ul className="nw-list">
        {shown.map((n) => (
          <li key={n.url}>
            <a href={n.url} target="_blank" rel="noopener noreferrer nofollow">
              <span className="nw-t">{n.official && <b className="nw-badge off">🏛 {t.nwOfficial}</b>}{n.title}</span>
              <span className="nw-m">{n.source}{n.trusted && !n.official && <span title={t.nwTrusted} aria-label={t.nwTrusted}> ✓</span>} · {ago(n.at)}</span>
            </a>
          </li>
        ))}
      </ul>
      {items.length > 3 && !all && <button className="link-btn" onClick={() => setAll(true)}>{t.nwMore} ({items.length - 3})</button>}
      <p className="nw-note">{t.nwNote}</p>
    </section>
  );
}
