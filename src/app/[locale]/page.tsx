import Link from "next/link";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { WebOnly } from "@/components/WebOnly";
import { SOON, cityName, COUNTRY } from "@/data/cities";
import { CityPicker, type CityGroup } from "@/components/CityPicker";
import { INTL_LOCALE } from "@/i18n/dictionaries";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  // Cidades agrupadas por país, com o nome do país no idioma do viajante (calculado no servidor).
  const region = new Intl.DisplayNames([INTL_LOCALE[params.locale]], { type: "region" });
  const groups: CityGroup[] = [];
  for (const c of await loadCities()) {
    const cc = COUNTRY[c.id];
    const label = (cc && region.of(cc)) || "—"; // cidades novas criadas no painel ficam num grupo à parte
    let g = groups.find((x) => x.label === label);
    if (!g) { g = { label, cities: [] }; groups.push(g); }
    g.cities.push({ id: c.id, name: cityName(c, params.locale), stops: c.stops.length });
  }
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <section className="hero stack">
        <span className="scan">▣ {t.scanned}</span>
        <h1>{t.heroA} <em>{t.europe}</em> {t.heroB}</h1>
      </section>
      <div className="stack" style={{ marginTop: 18 }}>
        <CityPicker locale={params.locale} groups={groups} soon={SOON.map((n) => n[params.locale] ?? n.en)}
          labels={{ choose: t.chooseCity, stops: t.stops, start: t.start, soon: t.soon }} />
        <p className="hint">{t.heroSub}</p>
        <WebOnly><Link className="merch-cta" href={`/${params.locale}/merchants`}>
          <div><b>{t.merchCta}</b><span>{t.merchSub}</span></div><i>→</i>
        </Link>
        <Link className="merch-cta alt" href={`/${params.locale}/agents`}>
          <div><b>{t.agCtaHome}</b><span>{t.agCtaHomeSub}</span></div><i>→</i>
        </Link></WebOnly>
      </div>
    </main>
  );
}
