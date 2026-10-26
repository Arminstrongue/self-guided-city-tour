import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { legalEN, legalPT, company, type LegalDoc } from "@/legal/content";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
const DOCS: LegalDoc[] = ["terms", "privacy", "cookies", "guides", "delete"];

export async function generateMetadata(props: { params: Promise<{ locale: Locale; doc: string }> }): Promise<Metadata> {
  const { locale, doc } = await props.params;
  if (!DOCS.includes(doc as LegalDoc)) return { title: "VOYBU" };
  return { title: `${(locale === "pt" ? legalPT : legalEN)(doc as LegalDoc).title} | VOYBU` };
}

export default async function Legal(props: { params: Promise<{ locale: Locale; doc: string }> }) {
  const params = await props.params;
  if (!DOCS.includes(params.doc as LegalDoc)) notFound();
  const content = (params.locale === "pt" ? legalPT : legalEN)(params.doc as LegalDoc);
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <article className="stack legal">
        <h1 style={{ fontSize: 28 }}>{content.title}</h1>
        <p className="hint">{params.locale === "pt" ? "Última atualização" : "Last updated"}: {params.locale === "pt" ? company().updated : company().updatedEn}</p>
        {content.sections.map((s) => (
          <section key={s.h} className="stack" style={{ gap: 6 }}>
            <h2 style={{ fontSize: 18 }}>{s.h}</h2>
            {s.p.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}
      </article>
    </main>
  );
}
