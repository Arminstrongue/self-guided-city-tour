import { Header } from "@/components/Header";
import { Diary } from "@/components/Diary";
import { requestCurrency } from "@/lib/fx";
import { getDict, type Locale } from "@/i18n/dictionaries";

export default function DiaryPage({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <Diary t={t} locale={params.locale} />
    </main>
  );
}
