import Link from "next/link";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCity } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Success({ params, searchParams }: { params: { locale: Locale }; searchParams: { city?: string; email?: string; pending?: string } }) {
  const t = getDict(params.locale);
  const city = await loadCity(searchParams.city ?? "");
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        {searchParams.pending ? (
          <p className="note">{t.processing}</p>
        ) : (
          <>
            <h1 style={{ fontSize: 30 }}>✓ {t.successTitle}</h1>
            <p>{fmt(t.successSub, { email: searchParams.email ?? "" })}</p>
            <Link className="btn tram" href={`/${params.locale}/tour/${city?.id ?? "lis"}`}>{t.openTour}</Link>
          </>
        )}
      </div>
    </main>
  );
}
