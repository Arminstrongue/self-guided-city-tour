import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MeetView } from "@/components/Meet";
import { isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { requestCurrency } from "@/lib/fx";

export async function generateMetadata({ params, searchParams }: { params: { locale: Locale }; searchParams: Record<string, string | undefined> }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const p = (searchParams.p ?? "").slice(0, 80);
  return { title: `${p ? `${p} · ` : ""}${t.dx.meetTitle} | VOYBU`, description: t.dx.meetSub, robots: { index: false } };
}

/** Ponto de encontro partilhado por link (ou o formulário para marcar um). */
export default function Meet({ params }: { params: { locale: Locale } }) {
  if (!isLocale(params.locale)) notFound();
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <MeetView locale={params.locale} />
    </main>
  );
}
