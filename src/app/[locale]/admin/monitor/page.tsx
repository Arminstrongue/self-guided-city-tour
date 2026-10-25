import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { checksFor, uptime, since, uptimeSince } from "@/lib/monitor";
import { igEnabled, summaryLines, type IgComment, type IgMedia } from "@/lib/instagram";
import { staleData } from "@/lib/data-freshness";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
const when = (d: Date) => new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Lisbon" }).format(d);

/** Estado do circuito de monitorização: cada verificação, disponibilidade (24 h e 7 dias), Instagram e dados por rever. */
export default async function Monitor(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  if (!(await isAdmin())) redirect(`/${params.locale}/admin`);
  const d = await db();
  const now = new Date();
  const checks = checksFor(env.appUrl, process.env.MONITOR_INTERNAL || undefined);
  const states = new Map((await d.select().from(schema.monitorState)).map((s) => [s.name, s]));
  const day = new Map((await uptimeSince(new Date(now.getTime() - 86400_000))).map((u) => [u.name, u]));
  const week = new Map((await uptimeSince(new Date(now.getTime() - 7 * 86400_000))).map((u) => [u.name, u]));
  const incidents = await d.select({ name: schema.monitorLog.name, at: schema.monitorLog.at, status: schema.monitorLog.status })
    .from(schema.monitorLog).where(sql`not ${schema.monitorLog.ok} and ${schema.monitorLog.at} > now() - interval '7 days'`).orderBy(desc(schema.monitorLog.at)).limit(20);
  const rows = [...checks.map((c) => ({ name: c.name, label: c.label })), ...(igEnabled() ? [{ name: "instagram", label: "Instagram (API oficial)" }] : [])];
  const down = rows.filter((r) => states.get(r.name) && !states.get(r.name)!.ok).length;
  const [ig] = igEnabled() ? await d.select().from(schema.socialSnapshots).where(eq(schema.socialSnapshots.network, "instagram")).orderBy(desc(schema.socialSnapshots.at)).limit(1) : [];
  const igData = (ig?.data ?? {}) as { media?: IgMedia[]; unanswered?: IgComment[] };
  const stale = staleData(now);
  const summary = await d.select().from(schema.monitorState).where(eq(schema.monitorState.name, "_summary"));
  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 20, gap: 20 }}>
        <div className="top-row"><h1>Monitorização</h1><Link className="mini" href={`/${params.locale}/admin`}>← Administração</Link></div>
        <div className={`card mon-sum ${down ? "bad" : "good"}`}>
          <b>{states.size === 0 ? "Ainda sem verificações — a primeira corre 2 minutos depois do arranque do worker." : down ? `${down} verificação(ões) com problema` : "Tudo a funcionar"}</b>
          <small>Verificação a cada 5 minutos · alerta por email à 2.ª falha seguida e quando recupera · resumo diário{summary[0] ? ` (último: ${when(summary[0].lastAt)})` : ""}</small>
        </div>

        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="mon-t">
            <thead><tr><th>Verificação</th><th>Estado</th><th>24 h</th><th>7 dias</th><th>Tempo</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const s = states.get(r.name), u1 = day.get(r.name), u7 = week.get(r.name);
                return (
                  <tr key={r.name}>
                    <td><b>{r.label}</b>{s?.lastError ? <small className="mon-err">{s.lastError}</small> : null}</td>
                    <td>{!s ? "—" : s.ok ? <span className="mon-ok">● ok</span> : <span className="mon-bad">● em baixo há {since(now.getTime() - s.since.getTime())}</span>}</td>
                    <td>{u1 ? uptime(u1.ok, u1.total) : "—"}</td>
                    <td>{u7 ? uptime(u7.ok, u7.total) : "—"}</td>
                    <td>{r.name === "tls" ? (s ? `${s.lastStatus} dias` : "—") : u1 ? `${u1.avg} ms` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="card stack" style={{ gap: 8 }}>
          <h2 style={{ margin: 0 }}>Instagram</h2>
          {!igEnabled() ? <p className="muted">Por ligar. No servidor, adicione ao .env <code>IG_ACCESS_TOKEN</code> (e <code>IG_USER_ID</code> se a conta estiver ligada a uma Página do Facebook) e reinicie o worker.</p>
            : !ig ? <p className="muted">À espera da primeira leitura (até 1 hora).</p>
            : <>
              <ul className="mon-list">{summaryLines(ig.account, ig.followers, undefined, igData.media ?? [], igData.unanswered ?? [], now).map((l) => <li key={l}>{l}</li>)}</ul>
              {(igData.unanswered ?? []).length > 0 && <>
                <h3 style={{ margin: "8px 0 0" }}>Comentários por responder</h3>
                <ul className="mon-list">{igData.unanswered!.slice(0, 10).map((c) => <li key={c.id}><b>@{c.username ?? "?"}</b>: {c.text} {c.permalink ? <a href={c.permalink} target="_blank" rel="noreferrer">abrir</a> : null}</li>)}</ul>
              </>}
              <small className="muted">Atualizado: {when(ig.at)}</small>
            </>}
        </section>

        <section className="card stack" style={{ gap: 8 }}>
          <h2 style={{ margin: 0 }}>Dados de chegada por rever</h2>
          {stale.length ? <ul className="mon-list">{stale.map((l) => <li key={l}>{l}</li>)}</ul> : <p className="muted">Todos os guias de estação e terminais foram verificados nos últimos 9 meses.</p>}
        </section>

        <section className="card stack" style={{ gap: 8 }}>
          <h2 style={{ margin: 0 }}>Falhas nos últimos 7 dias</h2>
          {incidents.length ? <ul className="mon-list">{incidents.map((i) => <li key={i.name + i.at.toISOString()}>{when(i.at)} · {rows.find((r) => r.name === i.name)?.label ?? i.name}</li>)}</ul> : <p className="muted">Nenhuma falha registada.</p>}
        </section>
      </div>
    </main>
  );
}
