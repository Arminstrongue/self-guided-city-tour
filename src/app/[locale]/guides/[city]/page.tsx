import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { GuideCard } from "@/components/GuideCard";
import { requestCurrency } from "@/lib/fx";
import { loadCity } from "@/lib/content";
import { cityName } from "@/data/cities";
import { expireStale, listGuides } from "@/lib/guides";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

/** Guias de uma cidade, do melhor avaliado para o menos avaliado (média bayesiana). */
export default async function GuidesCity(props: { params: Promise<{ locale: Locale; city: string }> }) {
  const params = await props.params;
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  void expireStale().catch(() => undefined);
  const guides = await listGuides(city.id);
  const name = cityName(city, params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <div className="stack">
        <h1 style={{ fontSize: 30 }}>{fmt(t.gdTitle, { city: name })}</h1>
        <p className="hint">{t.gdSub}</p>
        {guides.map((g) => <GuideCard key={g.id} g={g} t={t} locale={params.locale} />)}
        {!guides.length && <p className="card" style={{ padding: 16 }}>{fmt(t.gdNone, { city: name })}</p>}
        <Link className="mini" href={`/${params.locale}/guides/join`}>{t.gdJoin} →</Link>
      </div>
    </main>
  );
}
