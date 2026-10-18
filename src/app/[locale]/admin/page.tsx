import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { loadCities } from "@/lib/content";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
const eur = (c: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(c / 100);

async function setMerchantStatus(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const id = String(form.get("id")); const status = String(form.get("status"));
  if (!["active", "cancelled"].includes(status)) return;
  const d = await db();
  await d.update(schema.merchants).set({ status: status as "active" | "cancelled" }).where(eq(schema.merchants.id, id));
  revalidatePath("/[locale]/admin", "page");
}

async function markCommissionsPaid(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const d = await db();
  await d.update(schema.commissions).set({ paidAt: new Date() })
    .where(sql`${schema.commissions.merchantId} = ${String(form.get("merchantId"))} and ${schema.commissions.paidAt} is null`);
  revalidatePath("/[locale]/admin", "page");
}

async function setAgentStatus(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const status = String(form.get("status"));
  if (!["active", "suspended"].includes(status)) return;
  const d = await db();
  await d.update(schema.agents).set({ status: status as "active" | "suspended" }).where(eq(schema.agents.id, String(form.get("id"))));
  revalidatePath("/[locale]/admin", "page");
}

async function markAgentPaid(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const d = await db();
  await d.update(schema.agentCommissions).set({ paidAt: new Date() })
    .where(sql`${schema.agentCommissions.agentId} = ${String(form.get("agentId"))} and ${schema.agentCommissions.paidAt} is null`);
  revalidatePath("/[locale]/admin", "page");
}

/** Comissão manual: negócios com empresas (licenças B2B, hotéis com contrato próprio). */
async function addAgentCommission(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const cents = Math.round(Number(String(form.get("amount")).replace(",", ".")) * 100);
  const desc = String(form.get("description") ?? "").trim().slice(0, 140);
  if (!Number.isFinite(cents) || cents <= 0 || !desc) return;
  const d = await db();
  await d.insert(schema.agentCommissions).values({ agentId: String(form.get("agentId")), amountCents: cents, description: desc });
  revalidatePath("/[locale]/admin", "page");
}

/** Painel interno: vendas, comerciantes e comissões. Acesso só para ADMIN_EMAILS. */
async function setGuideStatus(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const status = String(form.get("status"));
  if (!["active", "suspended", "rejected", "pending"].includes(status)) return;
  const d = await db();
  await d.update(schema.guides).set({ status: status as "active" | "suspended" | "rejected" | "pending" }).where(eq(schema.guides.id, String(form.get("id"))));
  revalidatePath("/[locale]/admin", "page");
}

export default async function Admin({ params }: { params: { locale: Locale } }) {
  if (!(await isAdmin())) {
    return (
      <main className="app"><div className="stack" style={{ paddingTop: 40 }}>
        <h1>Administração</h1><p>Entre com uma conta autorizada.</p>
        <Link className="btn" href={`/api/auth/signin?callbackUrl=/${params.locale}/admin`}>Entrar</Link>
      </div></main>
    );
  }
  const d = await db();
  const allCities = await loadCities({ includeInactive: true });
  const getCity = (id: string) => allCities.find((c) => c.id === id);
  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  const byCity = await d.select({ city: schema.accesses.city, scope: schema.accesses.scope, n: sql<number>`count(*)::int`, cents: sql<number>`coalesce(sum(${schema.accesses.amountCents}),0)::int` })
    .from(schema.accesses).where(gt(schema.accesses.createdAt, since)).groupBy(schema.accesses.city, schema.accesses.scope);
  const merchants = await d.select().from(schema.merchants).orderBy(desc(schema.merchants.createdAt)).limit(200);
  const due = await d.select({ merchantId: schema.commissions.merchantId, n: sql<number>`count(*)::int`, cents: sql<number>`sum(${schema.commissions.amountCents})::int` })
    .from(schema.commissions).where(isNull(schema.commissions.paidAt)).groupBy(schema.commissions.merchantId);
  const recent = await d.select().from(schema.accesses).orderBy(desc(schema.accesses.createdAt)).limit(20);
  const guides = await d.select().from(schema.guides).orderBy(desc(schema.guides.createdAt)).limit(300);
  const gBookings = await d.select({ guideId: schema.guideBookings.guideId, n: sql<number>`count(*) filter (where ${schema.guideBookings.status} in ('confirmed','completed'))::int`, cents: sql<number>`coalesce(sum(${schema.guideBookings.feeCents}) filter (where ${schema.guideBookings.status} in ('confirmed','completed')),0)::int`, open: sql<number>`count(*) filter (where ${schema.guideBookings.status} = 'requested')::int` })
    .from(schema.guideBookings).groupBy(schema.guideBookings.guideId);
  const agents = await d.select().from(schema.agents).orderBy(desc(schema.agents.createdAt)).limit(200);
  const agentDue = await d.select({ agentId: schema.agentCommissions.agentId, cents: sql<number>`coalesce(sum(case when ${schema.agentCommissions.paidAt} is null then ${schema.agentCommissions.amountCents} else 0 end),0)::int`, total: sql<number>`sum(${schema.agentCommissions.amountCents})::int` })
    .from(schema.agentCommissions).groupBy(schema.agentCommissions.agentId);
  const agentLeads = await d.select({ agentId: schema.leads.agentId, n: sql<number>`count(*)::int`, won: sql<number>`count(*) filter (where ${schema.leads.status} = 'won')::int` })
    .from(schema.leads).groupBy(schema.leads.agentId);

  const sales = byCity.reduce((a, r) => a + r.n, 0), revenue = byCity.reduce((a, r) => a + r.cents, 0);
  const mrr = merchants.filter((m) => m.status === "active").reduce((a, m) => a + (m.plan === "partner" ? 4900 : m.plan === "featured" ? 1900 : 0), 0);
  const name = (id: string) => merchants.find((m) => m.id === id)?.name ?? id.slice(0, 8);

  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 20 }}>
        <div className="top-row"><h1>Administração</h1><span className="links-row"><Link className="mini" href={`/${params.locale}/admin/metrics`}>Métricas e avaliações →</Link><Link className="mini" href={`/${params.locale}/admin/content`}>Editar cidades e paragens →</Link></span></div>
        <div className="kpis">
          <div className="card kpi"><span className="label">Acessos, 30 dias</span><b className="num">{sales}</b></div>
          <div className="card kpi"><span className="label">Receita, 30 dias</span><b className="num">{eur(revenue)}</b></div>
          <div className="card kpi"><span className="label">Assinaturas ativas / mês</span><b className="num">{eur(mrr)}</b></div>
          <div className="card kpi"><span className="label">Comissões por pagar</span><b className="num">{eur(due.reduce((a, r) => a + r.cents, 0))}</b></div>
        </div>

        <h2>Vendas por cidade (30 dias)</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Cidade</th><th>Tipo</th><th>Acessos</th><th>Receita</th></tr></thead>
          <tbody>{byCity.map((r) => <tr key={`${r.city}-${r.scope}`}><td>{r.city ? getCity(r.city)?.n.pt ?? r.city : "—"}</td><td>{r.scope === "all" ? "Passe Todas as Cidades" : "Cidade / férias"}</td><td className="num">{r.n}</td><td className="num">{eur(r.cents)}</td></tr>)}</tbody></table></div>

        <h2>Comerciantes</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Nome</th><th>Cidade / paragem</th><th>Plano</th><th>Estado</th><th>Código QR</th><th>Ação</th></tr></thead>
          <tbody>{merchants.map((m) => (
            <tr key={m.id}>
              <td>{m.name}<div className="hint">{m.email}</div></td>
              <td>{getCity(m.city)?.n.pt} · {getCity(m.city)?.stops.find((s) => s.id === m.stopId)?.n}</td>
              <td>{m.plan}</td>
              <td><span className={`pill ${m.status}`}>{m.status}</span></td>
              <td><code>{m.refCode}</code></td>
              <td>
                <form action={setMerchantStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  {m.status !== "active"
                    ? <button className="mini" name="status" value="active">Aprovar</button>
                    : <button className="mini" name="status" value="cancelled">Suspender</button>}
                </form>
              </td>
            </tr>))}</tbody></table></div>

        <h2>Comissões por pagar (Parceiro QR)</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Comerciante</th><th>Vendas</th><th>Valor</th><th>Ação</th></tr></thead>
          <tbody>{due.map((r) => (
            <tr key={r.merchantId}><td>{name(r.merchantId)}</td><td className="num">{r.n}</td><td className="num">{eur(r.cents)}</td>
              <td><form action={markCommissionsPaid}><input type="hidden" name="merchantId" value={r.merchantId} /><button className="mini">Marcar como pago</button></form></td></tr>))}</tbody></table></div>

        <h2>Comerciais independentes</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Comercial</th><th>Código</th><th>Estado</th><th>Negócios (fechados)</th><th>Clientes</th><th>Por pagar / total</th><th>Ações</th></tr></thead>
          <tbody>{agents.map((a) => {
            const c = agentDue.find((x) => x.agentId === a.id); const l = agentLeads.find((x) => x.agentId === a.id);
            return (
              <tr key={a.id}>
                <td>{a.name}<div className="hint">{a.email}{a.phone ? ` · ${a.phone}` : ""}{a.country ? ` · ${a.country}` : ""}</div></td>
                <td><code>{a.code}</code></td>
                <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                <td className="num">{l?.n ?? 0} ({l?.won ?? 0})</td>
                <td className="num">{merchants.filter((m) => m.agentId === a.id).length}</td>
                <td className="num">{eur(c?.cents ?? 0)} / {eur(c?.total ?? 0)}</td>
                <td>
                  <form action={setAgentStatus} style={{ display: "inline" }}><input type="hidden" name="id" value={a.id} />
                    {a.status !== "active" ? <button className="mini" name="status" value="active">Aprovar</button> : <button className="mini" name="status" value="suspended">Suspender</button>}
                  </form>{" "}
                  {(c?.cents ?? 0) > 0 && <form action={markAgentPaid} style={{ display: "inline" }}><input type="hidden" name="agentId" value={a.id} /><button className="mini">Marcar pago</button></form>}
                  <details><summary className="hint">+ comissão manual</summary>
                    <form action={addAgentCommission} className="stack" style={{ gap: 6, marginTop: 6 }}>
                      <input type="hidden" name="agentId" value={a.id} />
                      <input name="description" placeholder="Ex.: licença hotel X, 12 meses" required />
                      <input name="amount" placeholder="Valor em € (ex.: 150)" inputMode="decimal" required />
                      <button className="mini">Registar</button>
                    </form>
                  </details>
                </td>
              </tr>);
          })}</tbody></table></div>
        <p className="hint">Comissão automática: 20% de cada fatura de assinatura paga pelos clientes angariados, nos primeiros 12 meses. Ligação de angariação: /merchants?agent=CÓDIGO.</p>

        <h2>Guias ({guides.filter((g) => g.status === "pending").length} por aprovar)</h2>
        <p className="hint">Antes de aprovar, confirme a licença no registo oficial do país (quando exigida) e que a foto e o texto são adequados. O guia só aparece aos turistas depois de aprovado e com os pagamentos Stripe ativos.</p>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Guia</th><th>Cidade</th><th>Línguas</th><th>€/h</th><th>Licença</th><th>Estado</th><th>Pagamentos</th><th>Nota</th><th>Reservas</th><th>Comissão</th><th>Ação</th></tr></thead>
          <tbody>{guides.map((g) => { const bk = gBookings.find((b) => b.guideId === g.id); return (
            <tr key={g.id}>
              <td><Link href={`/${params.locale}/g/${g.id}`}>{g.name}</Link><br /><span className="hint">{g.email}{g.phone ? ` · ${g.phone}` : ""}</span></td>
              <td>{getCity(g.city)?.n.pt ?? g.city}</td><td>{g.languages.join(", ")}</td><td className="num">{eur(g.hourlyCents)}</td>
              <td>{g.licenseNo ?? "—"}</td><td>{g.status}</td><td>{g.payoutsReady ? "✓" : g.stripeAccountId ? "em curso" : "—"}</td>
              <td className="num">{g.ratingCount ? `${(g.ratingSum / g.ratingCount).toFixed(1)} (${g.ratingCount})` : "—"}</td>
              <td className="num">{bk?.n ?? 0}{bk?.open ? ` (+${bk.open} pendentes)` : ""}</td><td className="num">{eur(bk?.cents ?? 0)}</td>
              <td><form action={setGuideStatus} className="row" style={{ gap: 6 }}><input type="hidden" name="id" value={g.id} />
                {g.status !== "active" && <button className="mini" name="status" value="active">Aprovar</button>}
                {g.status === "pending" && <button className="mini" name="status" value="rejected">Recusar</button>}
                {g.status === "active" && <button className="mini" name="status" value="suspended">Suspender</button>}
              </form></td>
            </tr>); })}</tbody></table></div>

        <h2>Últimos acessos</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Data</th><th>Email</th><th>Cidade</th><th>Valor</th><th>Expira</th></tr></thead>
          <tbody>{recent.map((a) => (
            <tr key={a.id}><td>{a.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td><td>{a.email}</td><td>{a.scope === "all" ? "Passe Todas as Cidades" : `${a.city}${a.plan === "trip" ? " (3 dias)" : ""}`}</td>
              <td className="num">{eur(a.amountCents)}</td><td>{a.expiresAt.toISOString().slice(0, 16).replace("T", " ")}</td></tr>))}</tbody></table></div>
      </div>
    </main>
  );
}
