import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCity } from "@/lib/content";
import { currentTraveller } from "@/lib/wallet";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return { title: `${getDict(locale).successTitle} | VOYBU`, robots: { index: false } };
}

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
        ) : !email ? (
          // Sem sessão (página aberta à mão ou noutro navegador): não afirmar que houve pagamento.
          <>
            <h1 style={{ fontSize: 30 }}>{t.wallet}</h1>
            <p>{t.acSignIn}</p>
            <Link className="btn tram" href={`/${params.locale}/wallet?signin=1${city ? `&city=${city.id}` : ""}`}>{t.wSignIn}</Link>
          </>
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
