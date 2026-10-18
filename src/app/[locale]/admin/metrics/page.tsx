import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { dashboard } from "@/lib/metrics";
import { loadCities } from "@/lib/content";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
const eur = (c: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(c / 100);
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "—");
const STEP: Record<string, string> = {
  view_city: "Abriram a página da cidade (QR ou link)", checkout_start: "Começaram o pagamento", purchase: "Compraram",
  tour_open: "Abriram o roteiro", tour_done: "Concluíram o roteiro", rating: "Deixaram avaliação"
};

/** Painel de métricas: funil, receita, avaliações e NPS por período. */
export default async function Metrics({ params, searchParams }: { params: { locale: Locale }; searchParams: { d?: string } }) {
  if (!(await isAdmin())) {
    redirect(`/${params.locale}/admin`);
  }
  const days = [1, 7, 30, 90].includes(Number(searchParams.d)) ? Number(searchParams.d) : 30;
  const m = await dashboard(days);
  const cities = await loadCities({ includeInactive: true });
  const cname = (id: string) => (id === "all" ? "Passe Todas as Cidades" : cities.find((c) => c.id === id)?.n.pt ?? id);
  const top = Math.max(1, ...m.funnel.map((f) => f.n));
  const views = m.funnel[0].n;
  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 20, gap: 20 }}>
        <div className="top-row"><h1>Métricas</h1><Link className="mini" href={`/${params.locale}/admin`}>← Administração</Link></div>
        <div className="links-row">{[1, 7, 30, 90].map((d) => <Link key={d} className={`chip ${d === days ? "paid" : ""}`} href={`?d=${d}`}>{d === 1 ? "Hoje" : `${d} dias`}</Link>)}</div>

        <div className="kpis">
          <div className="card kpi"><span className="label">Receita</span><b className="num">{eur(m.revenue)}</b></div>
          <div className="card kpi"><span className="label">Compras</span><b className="num">{m.purchases}</b></div>
          <div className="card kpi"><span className="label">Conversão (página → compra)</span><b className="num">{pct(m.purchases, views)}</b></div>
          <div className="card kpi"><span className="label">Nota média</span><b className="num">{m.stars ? `${m.stars.toFixed(1)} ★` : "—"}</b></div>
          <div className="card kpi"><span className="label">NPS ({m.npsN} respostas)</span><b className="num">{m.nps ?? "—"}</b></div>
          <div className="card kpi"><span className="label">SOS / localização partilhada</span><b className="num">{m.sos} / {m.shares}</b></div>
        </div>

        <h2>Funil</h2>
        <div className="card funnel" style={{ padding: 16 }}>
          {m.funnel.map((f, i) => (
            <div key={f.key} className="stack" style={{ gap: 4 }}>
              <div className="row-between"><span>{STEP[f.key]}</span><span className="num"><b>{f.n}</b>{i > 0 && <span className="hint"> · {pct(f.n, m.funnel[i - 1].n)} do passo anterior</span>}</span></div>
              <div className="bar"><i style={{ width: `${(f.n / top) * 100}%` }} /></div>
            </div>
          ))}
          <p className="hint">Contagens anónimas, sem cookies. Página da cidade conta 1 vez por sessão; roteiro aberto e concluído 1 vez por dia e dispositivo.</p>
        </div>

        <h2>Por cidade</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Cidade</th><th>Visitas</th><th>Checkout</th><th>Compras</th><th>Conversão</th><th>Receita</th><th>Concluídos</th><th>Nota</th></tr></thead>
          <tbody>{m.byCity.map((c) => (
            <tr key={c.city}><td>{cname(c.city)}</td><td className="num">{c.views}</td><td className="num">{c.checkouts}</td><td className="num">{c.purchases}</td><td className="num">{pct(c.purchases, c.views)}</td><td className="num">{eur(c.revenue)}</td><td className="num">{c.done}</td><td className="num">{c.stars ? `${c.stars.toFixed(1)} (${c.ratings})` : "—"}</td></tr>
          ))}{!m.byCity.length && <tr><td colSpan={8} className="hint">Ainda sem dados neste período.</td></tr>}</tbody></table></div>

        <h2>Vendas por dia</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Dia</th><th>Compras</th><th>Receita</th></tr></thead>
          <tbody>{m.daily.map((r) => <tr key={r.day}><td>{r.day}</td><td className="num">{r.n}</td><td className="num">{eur(r.cents)}</td></tr>)}</tbody></table></div>

        <h2>Comentários recentes</h2>
        <div className="stack" style={{ gap: 8 }}>
          {m.comments.map((r) => (
            <div key={r.id} className="card stack" style={{ gap: 4, padding: 14 }}>
              <div className="row-between"><b>{"★".repeat(r.stars)}<span className="hint">{"★".repeat(5 - r.stars)}</span> · {cname(r.city)}</b><span className="hint">{r.createdAt.toISOString().slice(0, 10)} · {r.locale ?? ""}{r.nps !== null ? ` · NPS ${r.nps}` : ""}</span></div>
              <p>{r.comment}</p>
            </div>
          ))}
          {!m.comments.length && <p className="hint">Ainda sem comentários.</p>}
        </div>
      </div>
    </main>
  );
}
