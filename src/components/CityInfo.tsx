/**
 * Página da cidade, além das fotos: "tudo o que é útil" num só lugar, o resumo de hoje (atualizado sozinho),
 * a história e cultura, e os conselhos práticos. Componentes de servidor (sem JavaScript no telemóvel).
 */
import Link from "next/link";
import type { City } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { PRACTICAL } from "@/data/practical";
import { stopName } from "@/data/stop-names";
import type { PulseData } from "@/lib/db/schema";

const WX = (code: number) => (code >= 95 ? "⛈️" : code >= 71 && code <= 77 ? "❄️" : code >= 51 ? "🌧️" : code >= 45 ? "🌫️" : code >= 2 ? "⛅️" : "☀️");

export function CityHub({ t, locale, city, name }: { t: Dict; locale: Locale; city: City; name: string }) {
  const items: [string, string, string][] = [
    ["🆕", t.hbToday, "#today"], ["🏛️", t.hbHistory, "#history"], ["🍽️", t.hbDo, "#explore"], ["🎟️", t.hbEvents, `/${locale}/wallet/agenda?city=${city.id}`],
    ["🧭", t.hbRoute, "#book"], ["🛟", t.hbSafety, "#safety"], ["💡", t.hbTips, "#goodtoknow"], ["💶", t.hbMoney, `/${locale}/wallet#tools`],
    ["🧑‍🏫", t.hbGuides, `/${locale}/guides/${city.id}`], ["💬", t.hbComments, "#comments"], ["📸", t.hbFeed, `/${locale}/wallet#feed:${city.id}`], ["🏆", t.hbRanking, `/${locale}/wallet#profile`]
  ];
  return (
    <section className="sec hub" aria-label={fmt(t.hbTitle, { city: name })}>
      <div className="sec-h"><div><h2>{fmt(t.hbTitle, { city: name })}</h2><p>{t.hbSub}</p></div></div>
      <nav className="hub-grid">{items.map(([ic, label, href]) => href.startsWith("#")
        ? <a key={label} href={href} className="hub-t press"><span aria-hidden="true">{ic}</span><b>{label}</b></a>
        : <Link key={label} href={href} className="hub-t press"><span aria-hidden="true">{ic}</span><b>{label}</b></Link>)}
      </nav>
    </section>
  );
}

export function CityToday({ t, locale, city, name, pulse }: { t: Dict; locale: Locale; city: City; name: string; pulse: { day: string; updatedAt: string; data: PulseData } | null }) {
  if (!pulse) return null;
  const d = pulse.data;
  const news = d.news?.[locale]?.length ? d.news[locale] : d.news?.en ?? [];
  const tr = d.trending;
  const df = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "long", day: "numeric", month: "long" });
  const stops = new Map(city.stops.map((s) => [s.id, stopName(s, locale)]));
  const empty = !d.weather && !d.events?.length && !news.length && !(tr && (tr.stops.length || tr.tags.length || tr.visitors));
  if (empty) return null;
  return (
    <section className="sec today" id="today">
      <div className="sec-h"><div><h2>🆕 {fmt(t.tdTitle, { city: name })}</h2><p>{df.format(new Date(`${pulse.day}T12:00:00Z`))} · {t.tdAuto}</p></div></div>
      <div className="td-grid">
        {d.weather && <div className="card td-wx"><span className="td-ic" aria-hidden="true">{WX(d.weather.code)}</span><b className="num">{d.weather.min}° – {d.weather.max}°</b><small className="hint">{d.weather.rain >= 50 ? `🌂 ${t.tdRain}` : t.tdDry}</small></div>}
        {tr && (tr.visitors > 0 || tr.comments > 0 || tr.posts > 0) && <div className="card td-wx"><span className="td-ic" aria-hidden="true">🔥</span><b className="num">{fmt(t.tdVisitors, { n: tr.visitors })}</b><small className="hint">{fmt(t.tdActivity, { c: tr.comments, p: tr.posts })}</small></div>}
      </div>
      {d.events && d.events.length > 0 && <div className="card stack td-list">
        <b>🎟️ {t.tdEvents}</b>
        {d.events.slice(0, 4).map((e) => <a key={e.url + e.when} href={e.url} target="_blank" rel="noopener noreferrer" className="td-row"><span className="num">{e.when.slice(5).replace("-", "/")}</span><span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{e.name}</b><small className="hint ad-ellip">{e.venue}</small></span></a>)}
        <Link className="link-btn" href={`/${locale}/wallet/agenda?city=${city.id}`}>{t.tdAllEvents} →</Link>
      </div>}
      {news.length > 0 && <div className="card stack td-list">
        <b>📰 {t.tdNews}</b>
        {news.slice(0, 3).map((n) => <a key={n.url} href={n.url} target="_blank" rel="noopener noreferrer" className="td-row"><span className="stack" style={{ gap: 0, minWidth: 0 }}><b>{n.title}</b><small className="hint">{n.source}</small></span></a>)}
      </div>}
      {tr && (tr.stops.length > 0 || tr.tags.length > 0) && <div className="card stack td-list">
        <b>📈 {t.tdTrending}</b>
        {tr.stops.length > 0 && <p style={{ margin: 0 }}>{tr.stops.map((s, i) => <span key={s.id}>{i ? " · " : ""}📍 {stops.get(s.id) ?? s.id}</span>)}</p>}
        {tr.tags.length > 0 && <div className="ex-chips">{tr.tags.map((x) => <Link key={x.tag} href={`/${locale}/wallet#tag:${encodeURIComponent(x.tag)}`}>#{x.tag}</Link>)}</div>}
      </div>}
    </section>
  );
}

export function CityHistory({ t, name, k }: { t: Dict; name: string; k: { summary: { title: string; text: string; url: string; lang: string } | null; history: { title: string; text: string; url: string; lang: string } | null } }) {
  if (!k.summary && !k.history) return null;
  const paras = (s: string) => s.split(/\n+/).filter((p) => p.trim().length > 1);
  return (
    <section className="sec hist" id="history">
      <div className="sec-h"><div><h2>🏛️ {fmt(t.hiTitle, { city: name })}</h2><p>{t.hiSub}</p></div></div>
      <article className="card hist-card">
        {k.summary && paras(k.summary.text).map((p, i) => <p key={`s${i}`} lang={k.summary!.lang}>{p}</p>)}
        {k.history && <details>
          <summary>{t.hiMore}</summary>
          {paras(k.history.text).map((p, i) => <p key={`h${i}`} lang={k.history!.lang}>{p}</p>)}
        </details>}
        <small className="hint hist-src">{t.hiSource} <a href={(k.history ?? k.summary)!.url} target="_blank" rel="noopener noreferrer">Wikipedia</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></small>
      </article>
    </section>
  );
}

export function GoodToKnow({ t, locale, city, name }: { t: Dict; locale: Locale; city: City; name: string }) {
  const g = PRACTICAL[city.id];
  if (!g) return null;
  const tx = (o: { pt: string; en: string }) => (locale === "pt" ? o.pt : o.en);
  return (
    <section className="sec" id="goodtoknow">
      <div className="sec-h"><div><h2>💡 {fmt(t.gkTitle, { city: name })}</h2><p>{t.gkSub}</p></div></div>
      <div className="card rows" style={{ paddingBlock: 6 }}>
        <div><span>🚨 {t.emergency}</span><a className="num" href={`tel:${g.emergency.split(" ")[0]}`}><b>{g.emergency}</b></a></div>
        {city.ap && <div><span>✈ {t.airportLbl}</span><span>{city.ap.iata} · {city.ap.name}</span></div>}
        <div><span>💶 {t.gkCurrency}</span><span>{city.cur}</span></div>
      </div>
      <div className="gk-grid">{g.tips.map((tip, i) => (
        <div key={i} className="card gk"><span className="label">{(t.tipK as Record<string, string>)[tip.k]}</span><p lang={locale === "pt" ? "pt" : "en"}>{tx(tip)}</p></div>
      ))}</div>
    </section>
  );
}
