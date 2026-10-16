import Link from "next/link";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { WebOnly } from "@/components/WebOnly";
import { SOON, cityName } from "@/data/cities";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <section className="hero stack">
        <span className="scan">▣ {t.scanned}</span>
        <h1>{t.heroA} <em>{t.europe}</em> {t.heroB}</h1>
        <p>{t.heroSub}</p>
      </section>
      <div className="stack" style={{ marginTop: 18 }}>
        <span className="label">{t.chooseCity}</span>
        <div className="cities">
          {(await loadCities()).map((c) => (
            <Link key={c.id} className="city" href={`/${params.locale}/c/${c.id}`}>
              <b>{cityName(c, params.locale)}</b>
              <small>{c.stops.length} {t.stops}</small>
            </Link>
          ))}
          {SOON.map((n) => (
            <span key={n} className="city off"><b>{n}</b><small>{t.soon}</small></span>
          ))}
        </div>
        <WebOnly><Link className="merch-cta" href={`/${params.locale}/merchants`}>
          <div><b>{t.merchCta}</b><span>{t.merchSub}</span></div><i>→</i>
        </Link></WebOnly>
      </div>
    </main>
  );
}
