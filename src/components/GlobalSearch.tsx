"use client";
/** Pesquisa global (lupa da carteira): cidades, paragens, pessoas, #hashtags e guias, com pesquisas recentes. */
import { useEffect, useRef, useState } from "react";
import { Search, X, MapPin, Landmark, Hash, BadgeCheck, Clock, Star } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { SearchResult } from "@/lib/search";
import { Avatar } from "./Social";

const KEY = "sgct:recent-search";
const flag = (cc: string) => (cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "🌍");
const readRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]").slice(0, 8); } catch { return []; } };

export function GlobalSearch({ t, locale, cities, onClose }: { t: Dict; locale: Locale; cities: Record<string, string>; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [r, setR] = useState<SearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const seq = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setRecent(readRecent()); setTimeout(() => input.current?.focus(), 60); }, []);
  useEffect(() => {
    const v = q.trim();
    if (v.replace(/^[#@]/, "").length < 2) { setR(null); return; }
    const n = ++seq.current; setBusy(true);
    const id = setTimeout(async () => {
      const j = await fetch(`/api/search?l=${locale}&q=${encodeURIComponent(v)}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
      if (n === seq.current) { setR(j); setBusy(false); }
    }, 220);
    return () => clearTimeout(id);
  }, [q, locale]);
  function remember() {
    const v = q.trim(); if (v.length < 2) return;
    const list = [v, ...readRecent().filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 8);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* sem armazenamento */ }
  }
  const go = (href: string) => { remember(); onClose(); if (href.startsWith("#")) location.hash = href.slice(1); else location.href = href; };
  const none = r && !r.cities.length && !r.stops.length && !r.people.length && !r.tags.length && !r.guides.length;
  return (
    <div className="sheet-bg" style={{ zIndex: 96 }} onClick={onClose}>
      <div className="sheet gs" onClick={(e) => e.stopPropagation()} aria-label={t.gsTitle}>
        <form className="gs-bar" role="search" onSubmit={(e) => { e.preventDefault(); remember(); input.current?.blur(); }}>
          <Search size={18} aria-hidden="true" />
          <input ref={input} type="search" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.gsPlaceholder} aria-label={t.gsTitle} autoComplete="off" />
          {q && <button type="button" className="gs-clear" onClick={() => { setQ(""); input.current?.focus(); }} aria-label={t.gsClear}><X size={16} aria-hidden="true" /></button>}
          <button type="button" className="link-btn gs-cancel" onClick={onClose}>{t.exCancel}</button>
        </form>

        {!r && !busy && (
          <div className="stack" style={{ gap: 14 }}>
            {recent.length > 0 && <section>
              <div className="gs-h"><b>{t.gsRecent}</b><button className="link-btn" onClick={() => { try { localStorage.removeItem(KEY); } catch { /* */ } setRecent([]); }}>{t.gsClear}</button></div>
              {recent.map((x) => <button key={x} className="gs-row" onClick={() => setQ(x)}><span className="gs-ic"><Clock size={18} aria-hidden="true" /></span><span className="gs-t"><b>{x}</b></span></button>)}
            </section>}
            <section>
              <div className="gs-h"><b>{t.gsCities}</b></div>
              <div className="ex-chips">{Object.entries(cities).slice(0, 14).map(([id, n]) => <a key={id} href={`/${locale}/c/${id}`}>📍 {n}</a>)}</div>
            </section>
            <p className="hint" style={{ margin: 0 }}>{t.gsTip}</p>
          </div>
        )}
        {busy && !r && <p className="hint" aria-live="polite">{t.exLoading}</p>}
        {none && <div className="gp-empty"><span aria-hidden="true">🔍</span><b>{t.gsNone}</b><p className="hint" style={{ margin: 0 }}>{t.gsNoneSub}</p></div>}
        {r && (
          <div className="stack" style={{ gap: 14 }} aria-live="polite">
            {r.cities.length > 0 && <section><div className="gs-h"><b>{t.gsCities}</b></div>
              {r.cities.map((c) => <button key={c.id} className="gs-row" onClick={() => go(`/${locale}/c/${c.id}`)}><span className="gs-ic big">{flag(c.country)}</span><span className="gs-t"><b>{c.name}</b><small>{t.gsCitySub}</small></span></button>)}</section>}
            {r.stops.length > 0 && <section><div className="gs-h"><b>{t.gsPlaces}</b></div>
              {r.stops.map((s) => <button key={`${s.city}-${s.id}`} className="gs-row" onClick={() => go(`/${locale}/tour/${s.city}#s-${s.id}`)}><span className="gs-ic">{s.top ? <Landmark size={18} aria-hidden="true" /> : <MapPin size={18} aria-hidden="true" />}</span><span className="gs-t"><b>{s.name}</b><small>{s.cityName}</small></span></button>)}</section>}
            {r.people.length > 0 && <section><div className="gs-h"><b>{t.gsPeople}</b></div>
              {r.people.map((p) => <button key={p.handle} className="gs-row" onClick={() => go(`/${locale}/u/${p.handle}`)}><Avatar p={p} size={40} /><span className="gs-t"><b>{p.name}</b><small>@{p.handle}</small></span></button>)}</section>}
            {r.tags.length > 0 && <section><div className="gs-h"><b>{t.gsTags}</b></div>
              {r.tags.map((x) => <button key={x.tag} className="gs-row" onClick={() => go(`#tag:${encodeURIComponent(x.tag)}`)}><span className="gs-ic"><Hash size={18} aria-hidden="true" /></span><span className="gs-t"><b>#{x.tag}</b><small>{x.n === 1 ? t.gsPost1 : t.gsPosts.replace("{n}", String(x.n))}</small></span></button>)}</section>}
            {r.guides.length > 0 && <section><div className="gs-h"><b>{t.gsGuides}</b></div>
              {r.guides.map((g) => <button key={g.id} className="gs-row" onClick={() => go(`/${locale}/g/${g.id}`)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {g.photo ? <img className="gs-av" src={`/api/guides/photo/${g.id}`} alt="" /> : <span className="gs-ic"><BadgeCheck size={18} aria-hidden="true" /></span>}
                <span className="gs-t"><b>{g.name}</b><small>{g.cityName}{g.rating ? <> · <Star size={11} fill="currentColor" aria-hidden="true" /> {g.rating}</> : null}</small></span></button>)}</section>}
          </div>
        )}
      </div>
    </div>
  );
}
