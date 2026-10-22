import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { company } from "@/legal/content";
import { infoEN, infoPT, type InfoDoc } from "@/legal/info";
import { loadCities } from "@/lib/content";
import { LOCALES } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";

/** Sobre nós / Apoio / Viajar com menos impacto / Contactos. */
export async function InfoPage({ locale, doc }: { locale: Locale; doc: InfoDoc }) {
  const co = company();
  const ctx = {
    company: co.name.startsWith("[") ? "ARMINSTRONGUE HUAMBO - SOCIEDADE UNIPESSOAL LDA" : co.name,
    // support@ só quando estiver configurado (SUPPORT_EMAIL); até lá, o email geral da empresa.
    support: process.env.SUPPORT_EMAIL?.trim() || co.email,
    hello: co.email, cities: (await loadCities()).length, langs: LOCALES.length,
    nipc: co.nipc.startsWith("[") ? "519703871" : co.nipc
  };
  const c = (locale === "pt" ? infoPT : infoEN)(doc, ctx);
  const mail = (s: string) => s.split(/(\S+@\S+\.[a-z]+)/i).map((x, i) => (i % 2 ? <a key={i} href={`mailto:${x}`}>{x}</a> : x));
  return (
    <main className="app">
      <Header locale={locale} currency={requestCurrency()} />
      <article className="stack legal info-page">
        <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>{c.title}</h1>
        <p className="info-lead">{mail(c.lead)}</p>
        {c.blocks.map((b) => (
          <section key={b.h} className="stack" style={{ gap: 8 }}>
            <h2 style={{ fontSize: 19 }}>{b.h}</h2>
            {b.p?.map((p, i) => <p key={i}>{mail(p)}</p>)}
            {b.li && <ul className="info-list">{b.li.map((x) => <li key={x}>{x}</li>)}</ul>}
            {b.qa && <div className="info-faq">{b.qa.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>}
          </section>
        ))}
      </article>
    </main>
  );
}
