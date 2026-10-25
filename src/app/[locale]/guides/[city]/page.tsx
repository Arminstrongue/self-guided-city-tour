import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { GuideCard, langNames } from "@/components/GuideCard";
import { GuideFilters } from "@/components/GuideFilters";
import { Suspense } from "react";
import { requestCurrency } from "@/lib/fx";
import { loadCity } from "@/lib/content";
import { cityName } from "@/data/cities";
import { expireStale, listGuides } from "@/lib/guides";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

/** Guias de uma cidade, do melhor avaliado para o menos avaliado (média bayesiana). */
export default async function GuidesCity(props: { params: Promise<{ locale: Locale; city: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await props.params;
  const sp = await props.searchParams;
  const all = (k: string) => ([] as string[]).concat(sp[k] ?? []);
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  void expireStale().catch(() => undefined);
  const listed = await listGuides(city.id);
  // Filtros (idioma, preço máximo por hora, avaliação mínima) vêm do endereço.
  const langsWanted = all("lang"), max = Number(all("max")[0] ?? 0), minR = Number(all("rating")[0] ?? 0);
  const guides = listed.filter((g) => (!langsWanted.length || g.languages.some((l) => langsWanted.includes(l))) && (!max || g.hourlyCents <= max * 100) && (!minR || (g.ratingCount > 0 && g.ratingSum / g.ratingCount >= minR)));
  const langCodes = [...new Set(listed.flatMap((g) => g.languages))];
  const name = cityName(city, params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <div className="stack">
        <h1 style={{ fontSize: 30 }}>{fmt(t.gdTitle, { city: name })}</h1>
        <p className="hint">{t.gdSub}</p>
        {listed.length > 1 && <Suspense><GuideFilters locale={params.locale} count={guides.length} langs={langCodes.map((c, i) => ({ code: c, name: langNames([c], params.locale)[0] ?? c })).sort((a, b) => a.name.localeCompare(b.name))} /></Suspense>}
        {guides.map((g) => <GuideCard key={g.id} g={g} t={t} locale={params.locale} />)}
        {!guides.length && <p className="card" style={{ padding: 16 }}>{fmt(t.gdNone, { city: name })}</p>}
        <Link className="mini" href={`/${params.locale}/guides/join`}>{t.gdJoin} →</Link>
      </div>
    </main>
  );
}
