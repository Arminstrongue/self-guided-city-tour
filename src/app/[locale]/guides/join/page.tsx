import { Header } from "@/components/Header";
import { GuideForm, GuideRelink } from "@/components/Guides";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName } from "@/data/cities";
import { guideCityOk } from "@/lib/guide-input";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

/** Candidatura de guia (fica pendente até aprovação no admin). */
export default async function GuideJoin({ params, searchParams }: { params: { locale: Locale }; searchParams: { expired?: string; city?: string } }) {
  const t = getDict(params.locale);
  const cities = (await loadCities()).filter((c) => guideCityOk(c.id)).map((c) => ({ id: c.id, name: cityName(c, params.locale) })).sort((a, b) => a.name.localeCompare(b.name));
  const first = searchParams.city && cities.some((c) => c.id === searchParams.city) ? searchParams.city : cities[0]?.id;
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <h1 style={{ fontSize: 28 }}>{t.gjTitle}</h1>
        <p className="hint">{t.gjSub}</p>
        <div className="card stack" style={{ gap: 8, padding: 14 }}>{t.gjSteps.map((s, i) => <p key={i}><b className="num">{i + 1}.</b> {s}</p>)}</div>
        {searchParams.expired && <p className="err">{t.gjExpired}</p>}
        <GuideForm locale={params.locale} cities={cities} initial={{ city: first }} mode="join" />
        <div className="card stack" style={{ gap: 8, padding: 14 }}><b>{t.gjHave}</b><GuideRelink locale={params.locale} /></div>
      </div>
    </main>
  );
}
