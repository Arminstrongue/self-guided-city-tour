import { Header } from "@/components/Header";
import { WalletView } from "@/components/Wallet";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName } from "@/data/cities";
import { FREE_CITIES } from "@/lib/pricing";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function WalletPage({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  const cities = Object.fromEntries((await loadCities()).map((c) => [c.id, cityName(c, params.locale)]));
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <WalletView t={t} locale={params.locale} cities={cities} free={FREE_CITIES} />
    </main>
  );
}
