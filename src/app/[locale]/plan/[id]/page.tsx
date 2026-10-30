import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { PlanView } from "@/components/PlanView";
import { requestCurrency } from "@/lib/fx";
import { loadCity } from "@/lib/content";
import { currentTraveller, getPlan } from "@/lib/wallet";
import { exploreProps } from "@/lib/explore-props";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { hasCityAccess } from "@/lib/city-access";
import { LockedFor } from "@/components/LockedFor";

export const dynamic = "force-dynamic";

export default async function PlanPage(props: { params: Promise<{ locale: Locale; id: string }> }) {
  const params = await props.params;
  const email = await currentTraveller();
  if (!email) redirect(`/${params.locale}/wallet`);
  const plan = /^[0-9a-f-]{36}$/i.test(params.id) ? await getPlan(email, params.id) : null;
  if (!plan) notFound();
  const city = plan.city ? await loadCity(plan.city) : null;
  // O plano dia a dia só abre com passe ativo da cidade.
  if (city && !(await hasCityAccess(city.id, { activate: true }))) return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <h1 className="arv-h" style={{ marginTop: 16 }}>{plan.title}</h1>
      <LockedFor t={getDict(params.locale)} locale={params.locale} city={city.id} cityName={plan.cityName ?? city.id} what="plan" />
    </main>
  );
  const ex = city ? exploreProps(city, params.locale) : null;
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <PlanView locale={params.locale}
        plan={{ id: plan.id, title: plan.title, city: plan.city, cityName: plan.cityName, startDate: plan.startDate, days: plan.days, items: plan.items }}
        moments={ex?.moments ?? []} tz={city?.tz ?? "UTC"} />
    </main>
  );
}
