import { Header } from "@/components/Header";
import { VideoPage } from "@/components/Reels";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName } from "@/data/cities";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function VideoRoute(props: { params: Promise<{ locale: Locale; id: string }> }) {
  const params = await props.params;
  const cities = Object.fromEntries((await loadCities()).map((c) => [c.id, cityName(c, params.locale)]));
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <VideoPage locale={params.locale} id={params.id} cities={cities} />
    </main>
  );
}
