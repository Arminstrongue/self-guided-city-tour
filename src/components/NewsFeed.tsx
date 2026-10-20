"use client";
/** Feed de notícias de segurança na carteira: das cidades do viajante e de viagens em geral, no idioma dele. */
import { useEffect, useMemo, useState } from "react";
import { INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";
import type { NewsItem } from "@/lib/news";

type Item = NewsItem & { city: string | null };

export function NewsFeed({ t, locale, cities, mine }: { t: Dict; locale: Locale; cities: Record<string, string>; mine: string[] }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [n, setN] = useState(6);
  const ids = useMemo(() => [null, ...mine.filter((c) => cities[c]).slice(0, 4)], [mine, cities]);
  useEffect(() => {
    let alive = true;
    const load = () => Promise.all(ids.map((c) => fetch(`/api/news?locale=${locale}${c ? `&city=${c}` : ""}`).then((r) => (r.ok ? r.json() : null)).then((j) => ((j?.items ?? []) as NewsItem[]).map((x) => ({ ...x, city: c }))).catch(() => [] as Item[])))
      .then((all) => {
        if (!alive) return;
        const seen = new Set<string>();
        setItems(all.flat().filter((x) => !seen.has(x.url) && (seen.add(x.url), true)).sort((a, b) => Number(Boolean(b.official)) - Number(Boolean(a.official)) || b.at - a.at));
      });
    void load();
    const id = setInterval(load, 10 * 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [ids, locale]);
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto", style: "short" });
  const ago = (at: number) => { const m = Math.round((at - Date.now()) / 60_000); return Math.abs(m) < 60 ? rtf.format(m, "minute") : Math.abs(m) < 2880 ? rtf.format(Math.round(m / 60), "hour") : rtf.format(Math.round(m / 1440), "day"); };
  const list = (items ?? []).filter((x) => filter === "all" || (filter === "general" ? x.city === null : x.city === filter));
  async function share(x: Item) {
    try { if (navigator.share) await navigator.share({ title: x.title, url: x.url }); else window.open(`https://wa.me/?text=${encodeURIComponent(`${x.title} ${x.url}`)}`, "_blank", "noopener"); } catch { /* cancelado */ }
  }
  return (
    <section className="stack nf" style={{ gap: 10 }} aria-live="polite">
      <div className="row-between"><h2 className="gp-h2"><span className="nw-live">●</span> {t.nwTitle}</h2></div>
      <div className="ex-chips scroll">
        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>{t.nwAll}</button>
        <button className={filter === "general" ? "on" : ""} onClick={() => setFilter("general")}>✈️ {t.nwGeneral}</button>
        {ids.filter(Boolean).map((c) => <button key={c} className={filter === c ? "on" : ""} onClick={() => setFilter(c!)}>📍 {cities[c!]}</button>)}
      </div>
      {items === null && [0, 1, 2].map((i) => <div key={i} className="card nf-item"><span className="nf-av skel" /><span className="stack" style={{ gap: 6, flex: 1 }}><span className="nw-skel" style={{ width: "40%" }} /><span className="nw-skel" /></span></div>)}
      {items && list.length === 0 && <div className="card gp-empty"><span aria-hidden="true">🛡</span><b>{t.nwNone}</b></div>}
      {list.slice(0, n).map((x) => (
        <article key={x.url} className={`card nf-item ${x.official ? "off" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {x.site ? <img className="nf-av" src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(x.site)}&sz=64`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.insertAdjacentHTML("afterend", '<span class="nf-av">📰</span>'); }} /> : <span className="nf-av">📰</span>}
          <div className="stack" style={{ gap: 4, flex: 1, minWidth: 0 }}>
            <div className="nf-meta"><b>{x.source}</b>{x.trusted && <span className="nf-ok" title={t.nwTrusted} aria-label={t.nwTrusted}>✓</span>}<span>· {ago(x.at)}</span>
              {x.city && cities[x.city] && <span className="nf-tag">📍 {cities[x.city]}</span>}{x.official && <span className="nw-badge off">🏛 {t.nwOfficial}</span>}</div>
            <a className="nf-t" href={x.url} target="_blank" rel="noopener noreferrer nofollow">{x.title}</a>
            <div className="nf-acts"><a href={x.url} target="_blank" rel="noopener noreferrer nofollow">↗ {t.nwRead}</a><button onClick={() => void share(x)}>↪ {t.diaryShare}</button></div>
          </div>
        </article>
      ))}
      {list.length > n && <button className="btn ghost press" onClick={() => setN(n + 6)}>{t.nwMore} ({list.length - n})</button>}
      <p className="nw-note">{t.nwNote}</p>
    </section>
  );
}
