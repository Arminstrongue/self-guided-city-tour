import Link from "next/link";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCity } from "@/lib/content";
import { currentTraveller } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export default async function Success(
  props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ city?: string; pending?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const t = getDict(params.locale);
  const city = await loadCity(searchParams.city ?? "");
  // O email vem da sessão (cookie), não do endereço da página — não fica no histórico nem em registos.
  const email = (await currentTraveller().catch(() => null)) ?? "";
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <div className="stack">
        {searchParams.pending ? (
          <p className="note">{t.processing}</p>
        ) : (
          <>
            <h1 style={{ fontSize: 30 }}>✓ {t.successTitle}</h1>
            <p>{email ? fmt(t.successSub, { email }) : t.successSub.split(/(?<=[.。])\s*/)[0]}</p>
            <Link className="btn tram" href={`/${params.locale}/tour/${city?.id ?? "lon"}`}>{t.openTour}</Link>
          </>
        )}
      </div>
    </main>
  );
}
