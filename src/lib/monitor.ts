/**
 * Circuito de monitorização (corre no serviço "worker"):
 * - de 5 em 5 minutos verifica páginas, API, certificado TLS e a app por dentro da rede do docker;
 * - uma falha só conta como "em baixo" à 2.ª verificação seguida (evita alarmes durante um deploy);
 * - envia email aos administradores quando algo cai e quando recupera, e um resumo diário;
 * - guarda o histórico 14 dias (disponibilidade e tempos) para a página /admin/monitor.
 */
import tls from "node:tls";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { env } from "./env";
import { sendEmail } from "./email";

export type Check = { name: string; label: string; url: string; expect?: string; maxMs?: number; kind?: "http" | "tls" };
export type Result = { name: string; ok: boolean; ms: number; status: number; error: string };
export type State = { ok: boolean; fails: number; alerted: boolean; since: Date };
export type Event = "down" | "up" | null;

export const FAILS_TO_ALERT = 2;
export const SLOW_MS = 8000;
export const TLS_WARN_DAYS = 14;

/** Lista de verificações a partir do endereço público (passa por Cloudflare e Caddy) e, se indicado, da app por dentro. */
export function checksFor(appUrl: string, internal?: string): Check[] {
  const u = appUrl.replace(/\/$/, "");
  const list: Check[] = [
    { name: "health", label: "Estado da app (API + base de dados)", url: `${u}/api/health`, expect: '"ok":true' },
    { name: "home-pt", label: "Página inicial (PT)", url: `${u}/pt`, expect: "VOYBU" },
    { name: "home-en", label: "Página inicial (EN)", url: `${u}/en`, expect: "VOYBU" },
    { name: "start", label: "Começar (escolher cidade)", url: `${u}/pt/start` },
    { name: "city", label: "Página de cidade (Lisboa)", url: `${u}/pt/c/lis`, expect: "Lisboa" },
    { name: "demo", label: "Roteiro de demonstração (Manchester)", url: `${u}/pt/tour/man` },
    { name: "arrive", label: "Acabei de chegar", url: `${u}/pt/arrive` },
    { name: "wallet", label: "App (carteira)", url: `${u}/pt/wallet` },
    { name: "dict", label: "Traduções (API)", url: `${u}/api/dict/pt` },
    { name: "sw", label: "Modo offline (service worker)", url: `${u}/sw.js` },
    { name: "tls", label: "Certificado HTTPS", url: u, kind: "tls" }
  ];
  if (internal) list.push({ name: "app-internal", label: "App por dentro (sem Cloudflare/Caddy)", url: `${internal.replace(/\/$/, "")}/api/health`, expect: '"ok":true' });
  return list;
}

/** Próximo estado de uma verificação e se é preciso avisar (cai à 2.ª falha seguida; recupera à 1.ª verificação boa). */
export function step(prev: State | undefined, ok: boolean, now: Date): { next: State; event: Event } {
  const p: State = prev ?? { ok: true, fails: 0, alerted: false, since: now };
  if (ok) {
    const event: Event = p.alerted ? "up" : null;
    return { next: { ok: true, fails: 0, alerted: false, since: p.ok ? p.since : now }, event };
  }
  const fails = p.fails + 1;
  if (fails < FAILS_TO_ALERT) return { next: { ...p, fails }, event: null };
  const next: State = { ok: false, fails, alerted: true, since: p.ok ? now : p.since };
  return { next, event: p.alerted ? null : "down" };
}

/** Disponibilidade em % (uma casa decimal) a partir de contagens. */
export function uptime(ok: number, total: number): string {
  if (!total) return "—";
  const v = Math.floor((ok / total) * 1000) / 10;
  return `${v.toFixed(1)} %`;
}

/** Duração legível em português (ex.: "1 h 05 min"). */
export function since(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ${String(m % 60).padStart(2, "0")} min`;
  return `${Math.floor(h / 24)} dias`;
}

async function httpCheck(c: Check): Promise<Result> {
  const t0 = Date.now();
  try {
    const res = await fetch(c.url, { redirect: "follow", cache: "no-store", headers: { "User-Agent": "VOYBU-Monitor/1.0", "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(20_000) });
    const body = await res.text();
    const ms = Date.now() - t0;
    if (!res.ok) return { name: c.name, ok: false, ms, status: res.status, error: `HTTP ${res.status}` };
    if (c.expect && !body.includes(c.expect)) return { name: c.name, ok: false, ms, status: res.status, error: `conteúdo esperado em falta ("${c.expect}")` };
    if (ms > (c.maxMs ?? SLOW_MS)) return { name: c.name, ok: false, ms, status: res.status, error: `muito lento (${(ms / 1000).toFixed(1)} s)` };
    return { name: c.name, ok: true, ms, status: res.status, error: "" };
  } catch (e) {
    return { name: c.name, ok: false, ms: Date.now() - t0, status: 0, error: String((e as Error)?.message ?? e).slice(0, 200) };
  }
}

/** Dias até o certificado expirar (o Caddy renova sozinho; se faltar pouco, a renovação está a falhar). */
function tlsCheck(c: Check): Promise<Result> {
  const host = new URL(c.url).hostname;
  const t0 = Date.now();
  return new Promise((resolve) => {
    const s = tls.connect({ host, port: 443, servername: host, timeout: 15_000 }, () => {
      const cert = s.getPeerCertificate();
      s.end();
      const days = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86400_000);
      const ok = s.authorized !== false && days >= TLS_WARN_DAYS;
      resolve({ name: c.name, ok, ms: Date.now() - t0, status: days, error: ok ? "" : s.authorized === false ? `certificado inválido (${s.authorizationError})` : `expira em ${days} dias` });
    });
    s.on("error", (e) => resolve({ name: c.name, ok: false, ms: Date.now() - t0, status: 0, error: String(e.message).slice(0, 200) }));
    s.on("timeout", () => { s.destroy(); resolve({ name: c.name, ok: false, ms: Date.now() - t0, status: 0, error: "sem resposta" }); });
  });
}

export const runCheck = (c: Check) => (c.kind === "tls" ? tlsCheck(c) : httpCheck(c));

const recipients = () => (process.env.MONITOR_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean).concat(env.adminEmails).filter((v, i, a) => a.indexOf(v) === i);

async function notify(subject: string, rows: string[]) {
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#102A43"><p><b>${subject}</b></p><ul>${rows.map((r) => `<li>${r}</li>`).join("")}</ul><p><a href="${env.appUrl}/pt/admin/monitor">Ver o estado completo</a></p></div>`;
  for (const to of recipients()) await sendEmail(to, `[VOYBU] ${subject}`, html, rows.join("\n")).catch(() => false);
}

/** Uma volta: corre todas as verificações, atualiza o estado, guarda o histórico e avisa quando algo muda. */
export async function monitorRound(log: (m: string) => void = console.log, extra: (() => Promise<Result | null>)[] = []) {
  const checks = checksFor(env.appUrl, process.env.MONITOR_INTERNAL || undefined);
  const results = await Promise.all(checks.map(runCheck));
  for (const fn of extra) { const r = await fn().catch(() => null); if (r) results.push(r); }
  const d = await db();
  const prev = new Map((await d.select().from(schema.monitorState)).map((r) => [r.name, r]));
  const now = new Date();
  const down: string[] = [], up: string[] = [];
  const label = (n: string) => checks.find((c) => c.name === n)?.label ?? n;
  for (const r of results) {
    const p = prev.get(r.name);
    const { next, event } = step(p ? { ok: p.ok, fails: p.fails, alerted: p.alerted, since: p.since } : undefined, r.ok, now);
    await d.insert(schema.monitorState).values({ name: r.name, ...next, lastAt: now, lastMs: r.ms, lastStatus: r.status, lastError: r.error })
      .onConflictDoUpdate({ target: schema.monitorState.name, set: { ...next, lastAt: now, lastMs: r.ms, lastStatus: r.status, lastError: r.error } });
    await d.insert(schema.monitorLog).values({ name: r.name, ok: r.ok, ms: r.ms, status: r.status, at: now });
    if (event === "down") down.push(`${label(r.name)}: ${r.error || "falhou"}`);
    if (event === "up") up.push(`${label(r.name)}: voltou ao normal (esteve em baixo ${since(now.getTime() - (p?.since ?? now).getTime())})`);
  }
  if (down.length) await notify(down.length === 1 ? "Alerta: um serviço está em baixo" : `Alerta: ${down.length} serviços em baixo`, down);
  if (up.length) await notify("Recuperado", up);
  const bad = results.filter((r) => !r.ok).length;
  log(`monitor: ${results.length - bad}/${results.length} ok${bad ? ` · falhas: ${results.filter((r) => !r.ok).map((r) => r.name).join(", ")}` : ""}`);
  return results;
}

/** Disponibilidade e tempo médio por verificação desde `from`. */
export async function uptimeSince(from: Date) {
  const d = await db();
  return d.select({
    name: schema.monitorLog.name,
    total: sql<number>`count(*)::int`,
    ok: sql<number>`count(*) filter (where ${schema.monitorLog.ok})::int`,
    avg: sql<number>`coalesce(avg(${schema.monitorLog.ms}) filter (where ${schema.monitorLog.ok}), 0)::int`
  }).from(schema.monitorLog).where(gte(schema.monitorLog.at, from)).groupBy(schema.monitorLog.name);
}

/** Apaga histórico com mais de 14 dias. */
export async function pruneMonitor() {
  const d = await db();
  await d.delete(schema.monitorLog).where(lt(schema.monitorLog.at, new Date(Date.now() - 14 * 86400_000)));
}

/** Resumo diário por email (uma vez por dia, depois das 07:00 UTC). */
export async function dailySummary(log: (m: string) => void, freshness: () => string[], social: () => Promise<string[]>) {
  const d = await db();
  const now = new Date();
  if (now.getUTCHours() < 7) return;
  const [row] = await d.select().from(schema.monitorState).where(eq(schema.monitorState.name, "_summary"));
  if (row && row.lastAt.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)) return;
  const up = await uptimeSince(new Date(now.getTime() - 86400_000));
  const states = await d.select().from(schema.monitorState).where(and(sql`${schema.monitorState.name} not like '\\_%'`));
  const labels = new Map(checksFor(env.appUrl, process.env.MONITOR_INTERNAL || undefined).map((c) => [c.name, c.label]));
  const rows = up.sort((a, b) => a.ok / a.total - b.ok / b.total).map((u) => `${labels.get(u.name) ?? u.name}: ${uptime(u.ok, u.total)} · ${u.avg} ms`);
  const downNow = states.filter((s) => !s.ok).map((s) => `${labels.get(s.name) ?? s.name}: em baixo há ${since(now.getTime() - s.since.getTime())} (${s.lastError})`);
  const all = [...downNow.map((r) => `⚠ ${r}`), ...rows, ...(await social().catch(() => [])), ...freshness()];
  await notify(downNow.length ? `Resumo diário: ${downNow.length} problema(s) em aberto` : "Resumo diário: tudo a funcionar", all);
  await d.insert(schema.monitorState).values({ name: "_summary", lastAt: now }).onConflictDoUpdate({ target: schema.monitorState.name, set: { lastAt: now } });
  log("monitor: resumo diário enviado");
}
