import { Header } from "@/components/Header";
import { WinNav } from "@/components/WinNav";
import { UserView } from "@/components/UserView";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName } from "@/data/cities";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function UserPage(props: { params: Promise<{ locale: Locale; handle: string }> }) {
  const params = await props.params;
  const t = getDict(params.locale);
  const cities = Object.fromEntries((await loadCities()).map((c) => [c.id, cityName(c, params.locale)]));
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <WinNav closeHref={`/${params.locale}/wallet`} labels={{ back: t.navBack, fwd: t.navFwd, close: t.close }} />
      <UserView locale={params.locale} handle={params.handle.toLowerCase()} cities={cities} />
    </main>
  );
}
