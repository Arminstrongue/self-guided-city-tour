import { Header } from "@/components/Header";
import { UserView } from "@/components/UserView";
import { requestCurrency } from "@/lib/fx";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default function UserPage({ params }: { params: { locale: Locale; handle: string } }) {
  const t = getDict(params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <UserView t={t} locale={params.locale} handle={params.handle.toLowerCase()} />
    </main>
  );
}
