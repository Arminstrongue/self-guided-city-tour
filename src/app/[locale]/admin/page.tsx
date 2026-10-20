import { purgeUser, removePost } from "@/lib/posts";
import { purgeChats } from "@/lib/chat";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { enabledProviders, isAdmin } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { loadCities } from "@/lib/content";
import type { Locale } from "@/i18n/dictionaries";
import { GuideAvatar } from "@/components/GuideCard";
import { missingLegal } from "@/lib/guide-input";

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

async function handleReport(form: FormData) {
  "use server";
  if (!(await isAdmin())) return;
  const d = await db();
  const id = String(form.get("id"));
  const [r] = await d.select().from(schema.reports).where(sql`${schema.reports.id} = ${id}`).limit(1);
  if (!r) return;
  if (form.get("action") === "removePost" && r.postId) {
    await removePost(r.postId);
    await d.update(schema.reports).set({ status: "removed" }).where(sql`${schema.reports.postId} = ${r.postId} and ${schema.reports.status} = 'open'`);
    revalidatePath("/[locale]/admin", "page");
    return;
  }
  if (form.get("action") === "remove") {
    await purgeUser(r.target);
    await purgeChats(r.target);
    await d.delete(schema.follows).where(sql`${schema.follows.follower} = ${r.target} or ${schema.follows.followee} = ${r.target}`);
    await d.delete(schema.travellerProfiles).where(sql`${schema.travellerProfiles.email} = ${r.target}`);
  }
  await d.update(schema.reports).set({ status: form.get("action") === "remove" ? "removed" : "dismissed" }).where(sql`${schema.reports.target} = ${r.target} and ${schema.reports.status} = 'open'`);
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

export default async function Admin({ params, searchParams }: { params: { locale: Locale }; searchParams: { expired?: string } }) {
  if (!(await isAdmin())) {
    return <main className="app"><AdminLogin locale={params.locale} expired={searchParams.expired === "1"} social={enabledProviders()} /></main>;
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

  const since60 = new Date(Date.now() - 60 * 24 * 3600_000);
  const [prev] = await d.select({ n: sql<number>`count(*)::int`, cents: sql<number>`coalesce(sum(${schema.accesses.amountCents}),0)::int` })
    .from(schema.accesses).where(sql`${schema.accesses.createdAt} > ${since60} and ${schema.accesses.createdAt} <= ${since}`);
  const daily = await d.select({ day: sql<string>`to_char(${schema.accesses.createdAt} at time zone 'Europe/Lisbon', 'YYYY-MM-DD')`, cents: sql<number>`coalesce(sum(${schema.accesses.amountCents}),0)::int`, n: sql<number>`count(*)::int` })
    .from(schema.accesses).where(gt(schema.accesses.createdAt, since)).groupBy(sql`1`);
  const [views] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.events)
    .where(sql`${schema.events.name} = 'view_city' and ${schema.events.createdAt} > ${since}`);
  const [gFee] = await d.select({ cents: sql<number>`coalesce(sum(${schema.guideBookings.feeCents}),0)::int`, n: sql<number>`count(*)::int` }).from(schema.guideBookings)
    .where(sql`${schema.guideBookings.status} in ('confirmed','completed') and ${schema.guideBookings.createdAt} > ${since}`);

  const sales = byCity.reduce((a, r) => a + r.n, 0), revenue = byCity.reduce((a, r) => a + r.cents, 0);
  const mrr = merchants.filter((m) => m.status === "active").reduce((a, m) => a + (m.plan === "partner" ? 4900 : m.plan === "featured" ? 1900 : 0), 0);
  const name = (id: string) => merchants.find((m) => m.id === id)?.name ?? id.slice(0, 8);
  const L = params.locale;
  const delta = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);
  const dRev = delta(revenue, prev?.cents ?? 0), dSales = delta(sales, prev?.n ?? 0);
  const conv = views?.n ? (sales / views.n) * 100 : null;
  const payDue = due.reduce((a, r) => a + r.cents, 0) + agentDue.reduce((a, r) => a + r.cents, 0);

  // Últimos 30 dias, um ponto por dia (hora de Lisboa).
  const fmtDay = (dt: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(dt);
  const days = Array.from({ length: 30 }, (_, k) => fmtDay(new Date(Date.now() - (29 - k) * 86400_000)));
  const series = days.map((day) => daily.find((x) => x.day === day) ?? { day, cents: 0, n: 0 });
  const peak = Math.max(1, ...series.map((x) => x.cents));

  const pendingGuides = guides.filter((g) => g.status === "pending");
  const pendingMerchants = merchants.filter((m) => m.status === "pending");
  const pendingAgents = agents.filter((a) => a.status === "pending");
  const openReq = gBookings.reduce((a, b) => a + b.open, 0);
  const openReports = await d.select({ r: schema.reports, handle: schema.travellerProfiles.handle, name: schema.travellerProfiles.name, bio: schema.travellerProfiles.bio, postText: schema.posts.text, postPhoto: schema.posts.photo })
    .from(schema.reports).leftJoin(schema.travellerProfiles, sql`${schema.travellerProfiles.email} = ${schema.reports.target}`)
    .leftJoin(schema.posts, sql`${schema.posts.id} = ${schema.reports.postId}`)
    .where(sql`${schema.reports.status} = 'open'`).orderBy(sql`${schema.reports.createdAt} desc`).limit(50);
  // Denúncias feitas a partir de uma conversa: as últimas 30 mensagens entre os dois (só para moderação).
  const chatLogs = new Map<string, { mine: boolean; text: string; at: Date }[]>();
  for (const { r } of openReports.filter((x) => x.r.note === "chat")) {
    const pair = [r.reporter, r.target].sort().join("|");
    const ms = await d.select().from(schema.messages).where(sql`${schema.messages.pair} = ${pair}`).orderBy(sql`${schema.messages.createdAt} desc`).limit(30);
    chatLogs.set(r.id, ms.reverse().map((m) => ({ mine: m.sender === r.target, text: m.text, at: m.createdAt })));
  }
  const todo = openReports.length + pendingGuides.length + pendingMerchants.length + pendingAgents.length + due.length + agentDue.filter((x) => x.cents > 0).length;
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Lisbon" }).format(new Date()));
  const hello = hour < 6 ? "Boa noite" : hour < 13 ? "Bom dia" : hour < 20 ? "Boa tarde" : "Boa noite";
  const today = new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Lisbon" }).format(new Date());
  const when = (dt: Date) => new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" }).format(dt);
  const Delta = ({ v }: { v: number | null }) => v === null ? <span className="hint">sem comparação</span> : <span className={`ad-delta ${v >= 0 ? "up" : "down"}`}>{v >= 0 ? "▲" : "▼"} {Math.abs(v)} % vs 30 dias antes</span>;
  const Empty = ({ icon, text }: { icon: string; text: string }) => <div className="ad-empty"><span aria-hidden="true">{icon}</span><span>{text}</span></div>;
  const guideStatus: Record<string, string> = { pending: "Por aprovar", active: "Ativo", suspended: "Suspenso", rejected: "Recusado" };

  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 16, gap: 22 }}>
        <section className="ad-hero">
          <div className="ad-hero-top">
            <span className="label" style={{ color: "rgba(255,255,255,.7)" }}>Administração · {today}</span>
            <form action={`/api/admin/logout?locale=${L}`} method="post"><button className="gp-out">Sair</button></form>
          </div>
          <h1 className="ad-title">{hello}.</h1>
          <p className="ad-sub">{todo ? `Tem ${todo} ${todo === 1 ? "assunto" : "assuntos"} à espera de decisão.` : "Está tudo em dia."}{openReq ? ` ${openReq} ${openReq === 1 ? "reserva aguarda" : "reservas aguardam"} resposta dos guias.` : ""}</p>
          <nav className="ad-links">
            <Link href={`/${L}/admin/metrics`}>📈 Métricas e NPS</Link>
            <Link href={`/${L}/admin/content`}>🗺 Cidades e paragens</Link>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer">💳 Stripe</a>
            <Link href={`/${L}`}>↗ Ver o site</Link>
          </nav>
        </section>

        <section className="ad-kpis">
          <div className="card ad-kpi hl"><span className="label">Receita · 30 dias</span><b>{eur(revenue)}</b><Delta v={dRev} /></div>
          <div className="card ad-kpi"><span className="label">Acessos vendidos</span><b>{sales}</b><Delta v={dSales} /></div>
          <div className="card ad-kpi"><span className="label">Conversão</span><b>{conv === null ? "—" : `${conv.toFixed(1)} %`}</b><span className="hint">{views?.n ?? 0} visitas a cidades</span></div>
          <div className="card ad-kpi"><span className="label">Comissão de guias</span><b>{eur(gFee?.cents ?? 0)}</b><span className="hint">{gFee?.n ?? 0} reservas confirmadas</span></div>
          <div className="card ad-kpi"><span className="label">Assinaturas / mês</span><b>{eur(mrr)}</b><span className="hint">{merchants.filter((m) => m.status === "active").length} parceiros ativos</span></div>
          <div className="card ad-kpi"><span className="label">Por pagar</span><b>{eur(payDue)}</b><span className="hint">a parceiros e comerciais</span></div>
        </section>

        <section className="card ad-chart">
          <div className="row-between"><b>Receita por dia</b><span className="hint">últimos 30 dias · {revenue ? `pico ${eur(peak)}` : "—"}</span></div>
          <div className="ad-bars-wrap">{revenue === 0 && <span className="ad-bars-empty">Sem vendas nos últimos 30 dias</span>}<div className="ad-bars" role="img" aria-label={`Receita diária, total ${eur(revenue)}`}>
            {series.map((x) => <span key={x.day} title={`${x.day}: ${eur(x.cents)} · ${x.n} acessos`} style={{ height: `${Math.max(x.cents ? 6 : 2, (x.cents / peak) * 100)}%` }} className={x.cents ? "on" : ""} />)}
          </div></div>
          <div className="row-between hint" style={{ fontSize: 12 }}><span>{series[0].day.slice(5).split("-").reverse().join("/")}</span><span>hoje</span></div>
        </section>

        <section className="stack" style={{ gap: 12 }} id="todo">
          <h2 className="gp-h2">A tratar agora{todo > 0 && <span className="gp-count">{todo}</span>}</h2>
          {todo === 0 && <Empty icon="✅" text="Nada pendente. Novos guias, parceiros e comissões aparecem aqui." />}
          {openReports.map(({ r, handle, name, bio, postText, postPhoto }) => (
            <div key={r.id} className="card ad-line">
              <div className="stack" style={{ gap: 2, minWidth: 0 }}><span className="label" style={{ color: "var(--warn)" }}>Denúncia · {r.reason}</span><b>{name ?? "(perfil apagado)"} {handle ? `@${handle}` : ""}</b>{bio && <span className="hint ad-ellip">{bio}</span>}{r.note && r.note !== "chat" && <span className="hint">“{r.note}”</span>}
                {chatLogs.get(r.id) && <details><summary className="hint">Conversa denunciada ({chatLogs.get(r.id)!.length} mensagens)</summary>
                  <div className="stack" style={{ gap: 4, marginTop: 6, fontSize: 13 }}>{chatLogs.get(r.id)!.map((m, i) => <span key={i}><b>{m.mine ? (handle ? `@${handle}` : "denunciado") : "quem denunciou"}:</b> {m.text}</span>)}</div></details>}
                {r.postId && <span className="row" style={{ gap: 8, alignItems: "flex-start" }}>{/* eslint-disable-next-line @next/next/no-img-element */}{postPhoto && <img src={postPhoto} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} />}<span className="hint">Publicação: {postText ? `“${postText.slice(0, 160)}”` : postPhoto ? "(só foto)" : "(já apagada)"}</span></span>}</div>
              <div className="row" style={{ gap: 6 }}>
                {handle && <a className="btn ghost press" href={`/pt/u/${handle}`} target="_blank" rel="noreferrer" style={{ width: "auto" }}>Ver</a>}
                <form action={handleReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value="dismiss" /><button className="btn ghost press">Arquivar</button></form>
                {r.postId && (postText !== null || postPhoto) && <form action={handleReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value="removePost" /><button className="btn press danger">Remover publicação</button></form>}
                <form action={handleReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value="remove" /><button className="btn press danger">Remover perfil</button></form>
              </div>
            </div>
          ))}
          {pendingGuides.map((g) => (
            <div key={g.id} className="card ad-review">
              <div className="ad-review-head">
                <GuideAvatar g={g} size={56} />
                <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                  <span className="label" style={{ color: "var(--cobalt)" }}>Novo guia · {getCity(g.city)?.n.pt ?? g.city}</span>
                  <b style={{ fontSize: 18 }}>{g.name}</b>
                  <span className="hint">{g.email}{g.phone ? ` · ${g.phone}` : ""} · {when(g.createdAt)}</span>
                </div>
              </div>
              <p className="ad-bio">“{g.bio}”</p>
              <div className="ad-facts">
                <span><small>Preço</small>{eur(g.hourlyCents)}/h</span>
                <span><small>Línguas</small>{g.languages.join(" · ").toUpperCase()}</span>
                <span><small>Grupo máx.</small>{g.maxPeople}</span>
                <span><small>Pagamentos</small>{g.payoutsReady ? "✓ ativos" : g.stripeAccountId ? "em curso" : "por ativar"}</span>
                <span><small>Foto</small>{g.photo ? "✓" : "sem foto"}</span>
                <span><small>Registo da atividade</small>{g.activityRegNo || "—"}</span>
                <span><small>Seguro</small>{g.insurer ? `${g.insurer}${g.policyNo ? ` · ${g.policyNo}` : ""}` : "—"}</span>
                <span><small>NIF · país</small>{g.taxId ? `${g.taxId} · ${g.taxCountry ?? "?"}` : "—"}</span>
                <span><small>Declaração</small>{g.independentAt ? `✓ ${when(g.independentAt)}` : "—"}</span>
              </div>
              {(missingLegal(g).length > 0 || !g.independentAt)
                ? <p className="ad-warn">⚠️ Faltam dados profissionais ({[...missingLegal(g), ...(g.independentAt ? [] : ["declaração"])].length}). O guia pode completá-los no portal; aprove só depois de confirmar o registo e o seguro.</p>
                : <p className="hint">Antes de aprovar, confirme o n.º {g.taxCountry === "PT" ? "no RNAAT (registo nacional do Turismo de Portugal)" : "no registo oficial do país"} e peça a apólice se tiver dúvidas.</p>}
              <form action={setGuideStatus} className="ad-actions"><input type="hidden" name="id" value={g.id} />
                <button className="btn press" name="status" value="active">✓ Aprovar</button>
                <button className="btn ghost press" name="status" value="rejected">Recusar</button>
                <Link className="mini" href={`/${L}/g/${g.id}`}>Pré-visualizar perfil →</Link>
              </form>
            </div>
          ))}
          {pendingMerchants.map((m) => (
            <div key={m.id} className="card ad-line">
              <div className="stack" style={{ gap: 2 }}><span className="label" style={{ color: "var(--cobalt)" }}>Parceiro por ativar · plano {m.plan}</span><b>{m.name}</b><span className="hint">{m.email} · {getCity(m.city)?.n.pt}</span></div>
              <form action={setMerchantStatus}><input type="hidden" name="id" value={m.id} /><button className="btn press" name="status" value="active">Aprovar</button></form>
            </div>
          ))}
          {pendingAgents.map((a) => (
            <div key={a.id} className="card ad-line">
              <div className="stack" style={{ gap: 2 }}><span className="label" style={{ color: "var(--cobalt)" }}>Novo comercial</span><b>{a.name}</b><span className="hint">{a.email}{a.country ? ` · ${a.country}` : ""}</span></div>
              <form action={setAgentStatus}><input type="hidden" name="id" value={a.id} /><button className="btn press" name="status" value="active">Aprovar</button></form>
            </div>
          ))}
          {due.map((r) => (
            <div key={r.merchantId} className="card ad-line">
              <div className="stack" style={{ gap: 2 }}><span className="label" style={{ color: "var(--warn)" }}>Comissão por pagar · parceiro QR</span><b>{name(r.merchantId)}</b><span className="hint">{r.n} vendas · {eur(r.cents)}</span></div>
              <form action={markCommissionsPaid}><input type="hidden" name="merchantId" value={r.merchantId} /><button className="btn ghost press">Marcar como pago</button></form>
            </div>
          ))}
          {agentDue.filter((x) => x.cents > 0).map((c) => (
            <div key={c.agentId} className="card ad-line">
              <div className="stack" style={{ gap: 2 }}><span className="label" style={{ color: "var(--warn)" }}>Comissão por pagar · comercial</span><b>{agents.find((a) => a.id === c.agentId)?.name ?? "—"}</b><span className="hint">{eur(c.cents)}</span></div>
              <form action={markAgentPaid}><input type="hidden" name="agentId" value={c.agentId} /><button className="btn ghost press">Marcar como pago</button></form>
            </div>
          ))}
        </section>

        <nav className="ad-tabs" aria-label="Secções">
          <a href="#vendas">Vendas</a><a href="#guias">Guias</a><a href="#parceiros">Parceiros</a><a href="#comerciais">Comerciais</a><a href="#acessos">Acessos</a>
        </nav>

        <section id="vendas" className="stack ad-sec">
          <h2 className="gp-h2">Vendas por cidade <span className="hint" style={{ fontWeight: 400 }}>30 dias</span></h2>
          {byCity.length ? (
            <div className="card ad-rank">
              {[...byCity].sort((a, b) => b.cents - a.cents).map((r) => (
                <div key={`${r.city}-${r.scope}`} className="ad-rank-row">
                  <span className="ad-rank-name">{r.scope === "all" ? "🌍 Passe Todas as Cidades" : `📍 ${r.city ? getCity(r.city)?.n.pt ?? r.city : "—"}`}</span>
                  <span className="ad-rank-bar"><i style={{ width: `${(r.cents / Math.max(1, revenue)) * 100}%` }} /></span>
                  <span className="hint">{r.n}×</span><b className="num">{eur(r.cents)}</b>
                </div>))}
            </div>
          ) : <Empty icon="🧾" text="Ainda sem vendas neste período." />}
        </section>

        <section id="guias" className="stack ad-sec">
          <div className="row-between" style={{ gap: 10 }}><h2 className="gp-h2">Guias <span className="hint" style={{ fontWeight: 400 }}>{guides.filter((g) => g.status === "active").length} ativos · {pendingGuides.length} por aprovar</span></h2>
            <a className="mini" href={`/api/admin/dac7?year=${new Date().getFullYear()}`}>⬇ Relatório DAC7 {new Date().getFullYear()}</a></div>
          {guides.length ? (
            <div className="ad-guides">
              {guides.map((g) => { const bk = gBookings.find((b) => b.guideId === g.id); return (
                <div key={g.id} className="card ad-guide">
                  <div className="row" style={{ gap: 12, flexWrap: "nowrap" }}>
                    <GuideAvatar g={g} size={44} />
                    <div className="stack" style={{ gap: 0, minWidth: 0, flex: 1 }}><Link href={`/${L}/g/${g.id}`} className="ad-gname">{g.name}</Link><span className="hint">{getCity(g.city)?.n.pt ?? g.city} · {eur(g.hourlyCents)}/h</span></div>
                    <span className={`pill ${g.status}`}>{guideStatus[g.status] ?? g.status}</span>
                  </div>
                  {(missingLegal(g).length > 0 || !g.independentAt) && <span className="ad-warn" style={{ margin: 0 }}>⚠️ Dados profissionais incompletos</span>}
                  <div className="ad-mini">
                    <span><small>Nota</small>{g.ratingCount ? `★ ${(g.ratingSum / g.ratingCount).toFixed(1)}` : "—"}</span>
                    <span><small>Reservas</small>{bk?.n ?? 0}{bk?.open ? ` +${bk.open}` : ""}</span>
                    <span><small>Comissão</small>{eur(bk?.cents ?? 0)}</span>
                    <span><small>Stripe</small>{g.payoutsReady ? "✓" : "—"}</span>
                  </div>
                  {g.status !== "pending" && <form action={setGuideStatus} className="row" style={{ gap: 8 }}><input type="hidden" name="id" value={g.id} />
                    {g.status === "active" ? <button className="mini" name="status" value="suspended">Suspender</button> : <button className="mini" name="status" value="active">Reativar</button>}
                  </form>}
                </div>); })}
            </div>
          ) : <Empty icon="🧭" text="Ainda sem guias. Partilhe /guides/join para recrutar." />}
        </section>

        <section id="parceiros" className="stack ad-sec">
          <h2 className="gp-h2">Parceiros QR <span className="hint" style={{ fontWeight: 400 }}>comerciantes nas paragens</span></h2>
          {merchants.length ? (
            <div className="table-wrap card"><table className="data"><thead><tr><th>Nome</th><th>Cidade / paragem</th><th>Plano</th><th>Estado</th><th>Código QR</th><th>Ação</th></tr></thead>
              <tbody>{merchants.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}<div className="hint">{m.email}</div></td>
                  <td>{getCity(m.city)?.n.pt} · {getCity(m.city)?.stops.find((s) => s.id === m.stopId)?.n}</td>
                  <td>{m.plan}</td>
                  <td><span className={`pill ${m.status}`}>{m.status}</span></td>
                  <td><code>{m.refCode}</code></td>
                  <td><form action={setMerchantStatus}><input type="hidden" name="id" value={m.id} />
                    {m.status !== "active" ? <button className="mini" name="status" value="active">Aprovar</button> : <button className="mini" name="status" value="cancelled">Suspender</button>}
                  </form></td>
                </tr>))}</tbody></table></div>
          ) : <Empty icon="🏪" text="Ainda sem parceiros. Os comerciantes registam-se em /merchants." />}
        </section>

        <section id="comerciais" className="stack ad-sec">
          <h2 className="gp-h2">Comerciais independentes</h2>
          {agents.length ? (
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
                      </form>
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
          ) : <Empty icon="🤝" text="Ainda sem comerciais. Registam-se em /agents." />}
          <p className="hint">Comissão automática: 20 % de cada fatura de assinatura dos clientes angariados, nos primeiros 12 meses. Ligação de angariação: /merchants?agent=CÓDIGO.</p>
        </section>

        <section id="acessos" className="stack ad-sec">
          <h2 className="gp-h2">Últimos acessos</h2>
          {recent.length ? (
            <div className="card ad-feed">
              {recent.map((a) => (
                <div key={a.id} className="ad-feed-row">
                  <span className="ad-feed-ic" aria-hidden="true">{a.scope === "all" ? "🌍" : "🎟"}</span>
                  <div className="stack" style={{ gap: 0, minWidth: 0, flex: 1 }}>
                    <b className="ad-ellip">{a.email}</b>
                    <span className="hint">{a.scope === "all" ? "Passe Todas as Cidades" : `${getCity(a.city ?? "")?.n.pt ?? a.city}${a.plan === "trip" ? " · 3 dias" : ""}`} · {when(a.createdAt)} · expira {when(a.expiresAt)}</span>
                  </div>
                  <b className="num">{eur(a.amountCents)}</b>
                </div>))}
            </div>
          ) : <Empty icon="🎟" text="Ainda sem acessos vendidos." />}
        </section>
      </div>
    </main>
  );
}
