"use client";
/** Notícias de segurança em fita "AO VIVO" fixa no fundo da carteira: das cidades do viajante e de viagens em geral. */
import { useEffect, useMemo, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { NewsItem } from "@/lib/news";

type Item = NewsItem & { city: string | null };

export function NewsFeed({ t, locale, cities, mine }: { t: Dict; locale: Locale; cities: Record<string, string>; mine: string[] }) {
  const [items, setItems] = useState<Item[]>([]);
  // Com cidades na viagem: só avisos dessas cidades (as notícias gerais de aeroportos ficam para quem ainda não tem viagem).
  const ids = useMemo(() => { const m = mine.filter((c) => cities[c]).slice(0, 4); return m.length ? m : [null]; }, [mine, cities]);
  useEffect(() => {
    let alive = true;
    const load = () => Promise.all(ids.map((c) => fetch(`/api/news?locale=${locale}${c ? `&city=${c}` : ""}`).then((r) => (r.ok ? r.json() : null)).then((j) => ((j?.items ?? []) as NewsItem[]).map((x) => ({ ...x, city: c }))).catch(() => [] as Item[])))
      .then((all) => {
        if (!alive) return;
        const seen = new Set<string>();
        setItems(all.flat().filter((x) => !seen.has(x.url) && (seen.add(x.url), true)).sort((a, b) => Number(Boolean(b.official)) - Number(Boolean(a.official)) || b.at - a.at).slice(0, 20));
      });
    void load();
    const id = setInterval(load, 10 * 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [ids, locale]);
  if (!items.length) return null;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const ago = (at: number) => { const h = Math.round((Date.now() - at) / 3600_000); return h < 24 ? rtf.format(-Math.max(1, h), "hour") : rtf.format(-Math.round(h / 24), "day"); };
  const tag = (x: Item) => (x.official ? `🏛 ${t.nwOfficial}` : x.city && cities[x.city] ? cities[x.city] : t.nwWorld);
  const row = (k: string) => (
    <span className="tk-row" aria-hidden={k === "b"}>
      {items.map((x) => (
        <a key={`${k}${x.url}`} href={x.url} target="_blank" rel="noopener noreferrer nofollow" tabIndex={k === "b" ? -1 : 0}>
          <span className="tk-dot">●</span><b className="tk-tag">{tag(x)}</b><span className="tk-t">{x.title}</span>
          {x.kind && <span className="tk-kind">→ {t.nwKind[x.kind]}</span>}
          <span className="tk-src">· {x.source} · {ago(x.at)}</span>
        </a>
      ))}
    </span>
  );
  return (
    <>
      <div className="tk-space" aria-hidden="true" />
      <aside className="tk" aria-label={t.nwTitle}>
        <span className="tk-live"><i />{t.nwLive}</span>
        <div className="tk-track" style={{ ["--tk-s" as string]: `${Math.max(40, items.length * 9)}s` }}>{row("a")}{row("b")}</div>
      </aside>
    </>
  );
}
