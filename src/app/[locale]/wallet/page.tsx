import { Header } from "@/components/Header";
import { WalletView } from "@/components/Wallet";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName, COUNTRY } from "@/data/cities";
import { FREE_CITIES } from "@/lib/pricing";
import { enabledProviders } from "@/lib/auth";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function WalletPage({ params }: { params: { locale: Locale } }) {
  const all = await loadCities();
  const cities = Object.fromEntries(all.map((c) => [c.id, cityName(c, params.locale)]));
  const tzOf = Object.fromEntries(all.map((c) => [c.id, c.tz ?? "UTC"]));
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <WalletView locale={params.locale} cities={cities} free={FREE_CITIES} countryOf={COUNTRY} tzOf={tzOf} providers={enabledProviders()} />
    </main>
  );
}
