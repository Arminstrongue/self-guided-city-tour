import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getCity } from "@/data/cities";
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

/** Painel interno: vendas, comerciantes e comissões. Acesso só para ADMIN_EMAILS. */
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
  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  const byCity = await d.select({ city: schema.accesses.city, scope: schema.accesses.scope, n: sql<number>`count(*)::int`, cents: sql<number>`coalesce(sum(${schema.accesses.amountCents}),0)::int` })
    .from(schema.accesses).where(gt(schema.accesses.createdAt, since)).groupBy(schema.accesses.city, schema.accesses.scope);
  const merchants = await d.select().from(schema.merchants).orderBy(desc(schema.merchants.createdAt)).limit(200);
  const due = await d.select({ merchantId: schema.commissions.merchantId, n: sql<number>`count(*)::int`, cents: sql<number>`sum(${schema.commissions.amountCents})::int` })
    .from(schema.commissions).where(isNull(schema.commissions.paidAt)).groupBy(schema.commissions.merchantId);
  const recent = await d.select().from(schema.accesses).orderBy(desc(schema.accesses.createdAt)).limit(20);

  const sales = byCity.reduce((a, r) => a + r.n, 0), revenue = byCity.reduce((a, r) => a + r.cents, 0);
  const mrr = merchants.filter((m) => m.status === "active").reduce((a, m) => a + (m.plan === "partner" ? 4900 : m.plan === "featured" ? 1900 : 0), 0);
  const name = (id: string) => merchants.find((m) => m.id === id)?.name ?? id.slice(0, 8);

  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 20 }}>
        <h1>Administração</h1>
        <div className="kpis">
          <div className="card kpi"><span className="label">Acessos, 30 dias</span><b className="num">{sales}</b></div>
          <div className="card kpi"><span className="label">Receita, 30 dias</span><b className="num">{eur(revenue)}</b></div>
          <div className="card kpi"><span className="label">Assinaturas ativas / mês</span><b className="num">{eur(mrr)}</b></div>
          <div className="card kpi"><span className="label">Comissões por pagar</span><b className="num">{eur(due.reduce((a, r) => a + r.cents, 0))}</b></div>
        </div>

        <h2>Vendas por cidade (30 dias)</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Cidade</th><th>Tipo</th><th>Acessos</th><th>Receita</th></tr></thead>
          <tbody>{byCity.map((r) => <tr key={`${r.city}-${r.scope}`}><td>{r.city ? getCity(r.city)?.n.pt ?? r.city : "—"}</td><td>{r.scope === "all" ? "Passe Europa" : "Cidade"}</td><td className="num">{r.n}</td><td className="num">{eur(r.cents)}</td></tr>)}</tbody></table></div>

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

        <h2>Últimos acessos</h2>
        <div className="table-wrap card"><table className="data"><thead><tr><th>Data</th><th>Email</th><th>Cidade</th><th>Valor</th><th>Expira</th></tr></thead>
          <tbody>{recent.map((a) => (
            <tr key={a.id}><td>{a.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td><td>{a.email}</td><td>{a.scope === "all" ? "Passe Europa" : a.city}</td>
              <td className="num">{eur(a.amountCents)}</td><td>{a.expiresAt.toISOString().slice(0, 16).replace("T", " ")}</td></tr>))}</tbody></table></div>
      </div>
    </main>
  );
}
