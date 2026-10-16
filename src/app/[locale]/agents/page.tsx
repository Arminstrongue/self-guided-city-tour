import { Header } from "@/components/Header";
import { AgentSignup } from "@/components/AgentSignup";
import { requestCurrency } from "@/lib/fx";
import { getDict, fmt, type Locale } from "@/i18n/dictionaries";
import { AGENT_COMMISSION, AGENT_MONTHS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** Página pública do programa de comerciais independentes. */
export default function Agents({ params, searchParams }: { params: { locale: Locale }; searchParams: { expired?: string } }) {
  const t = getDict(params.locale);
  const pct = Math.round(AGENT_COMMISSION * 100);
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <h1 style={{ fontSize: 28 }}>{t.agTitle}</h1>
        <p className="hint">{fmt(t.agSub, { p: pct, m: AGENT_MONTHS })}</p>
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          {[t.agStep1, t.agStep2, fmt(t.agStep3, { p: pct, m: AGENT_MONTHS })].map((s, i) => <p key={i}><b className="num">{i + 1}.</b> {s}</p>)}
        </div>
        {searchParams.expired && <p className="err">{t.agExpired}</p>}
        <AgentSignup locale={params.locale} t={t} />
      </div>
    </main>
  );
}
