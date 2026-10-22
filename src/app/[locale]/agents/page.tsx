import { Header } from "@/components/Header";
import { AgentSignup } from "@/components/AgentSignup";
import { requestCurrency } from "@/lib/fx";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { AGENT_COMMISSION, AGENT_MONTHS, MERCHANT_PLANS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** Página pública do programa de comerciais independentes. */
export default function Agents({ params, searchParams }: { params: { locale: Locale }; searchParams: { expired?: string } }) {
  const t = getDict(params.locale);
  const pct = Math.round(AGENT_COMMISSION * 100);
  const eur = (c: number) => new Intl.NumberFormat(INTL_LOCALE[params.locale], { style: "currency", currency: "EUR" }).format(c / 100);
  const feat = MERCHANT_PLANS.featured.amount;
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <h1 style={{ fontSize: 28, lineHeight: 1.15 }}>{t.hpTitle}</h1>
        <p className="hint" style={{ fontSize: 15 }}>{t.hpSub}</p>
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          {[t.agStep1, t.agStep2, fmt(t.agStep3, { p: pct, m: AGENT_MONTHS })].map((s, i) => <p key={i}><b className="num">{i + 1}.</b> {s}</p>)}
        </div>
        <section id="how" className="card stack" style={{ gap: 8, padding: 14, scrollMarginTop: 80 }}>
          <h2 className="gp-h2" style={{ margin: 0 }}>{t.agHowT}</h2>
          <ul className="mb-next">
            <li>{fmt(t.agHow1, { p: pct, m: AGENT_MONTHS })}</li>
            <li>{t.agHow2}</li>
            <li>{t.agHow3}</li>
            <li>{t.agHow4}</li>
          </ul>
          <p className="hint" style={{ margin: 0 }}>{fmt(t.agExample, { plan: t.mPlans.featured[0], price: eur(feat), c: eur(Math.round(feat * AGENT_COMMISSION)) })}</p>
        </section>
        {searchParams.expired && <p className="err">{t.agExpired}</p>}
        <div id="join" style={{ scrollMarginTop: 80 }}><AgentSignup locale={params.locale} t={t} /></div>
      </div>
    </main>
  );
}
