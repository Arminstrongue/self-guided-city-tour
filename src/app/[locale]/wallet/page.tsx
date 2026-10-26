import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { WalletView } from "@/components/Wallet";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName, COUNTRY } from "@/data/cities";
import { FREE_CITIES } from "@/lib/pricing";
import { enabledProviders } from "@/lib/auth";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return { title: `${getDict(locale).wallet} | VOYBU`, robots: { index: false } };
}

export default async function WalletPage(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  const all = await loadCities();
  const cities = Object.fromEntries(all.map((c) => [c.id, cityName(c, params.locale)]));
  const tzOf = Object.fromEntries(all.map((c) => [c.id, c.tz ?? "UTC"]));
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <WalletView locale={params.locale} cities={cities} free={FREE_CITIES} countryOf={COUNTRY} tzOf={tzOf} providers={enabledProviders()} />
    </main>
  );
}
