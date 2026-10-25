import { Header } from "@/components/Header";
import { WinNav } from "@/components/WinNav";
import { AccountView } from "@/components/AccountView";
import { requestCurrency } from "@/lib/fx";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function AccountPage(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  const t = getDict(params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <WinNav closeHref={`/${params.locale}/wallet`} labels={{ back: t.navBack, fwd: t.navFwd, close: t.close }} />
      <AccountView locale={params.locale} />
    </main>
  );
}
