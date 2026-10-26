/**
 * Eventos em tempo real (mensagens, "a escrever…", lidas, notificações).
 * Uma ligação SSE por separador; entre réplicas da app os eventos passam pelo PostgreSQL (LISTEN/NOTIFY).
 * Em desenvolvimento (pglite, um só processo) fica tudo em memória.
 */
import { EventEmitter } from "node:events";
import { sql } from "drizzle-orm";
import { db, schema } from "./db";

export type LiveEvent =
  | { t: "msg"; peer: string; m: import("./chat").ChatMsg }
  | { t: "unsend"; peer: string; id: string }
  | { t: "typing"; peer: string }
  | { t: "read"; peer: string; at: string }
  | { t: "react"; peer: string; id: string; reactions: { e: string; n: number; mine: boolean }[] }
  | { t: "notif" }
  | { t: "video"; id: string; status: "ready" | "failed" };

type Bus = { em: EventEmitter; listening: Promise<void> | null; pg: boolean };
declare global { var __sgctLive: Bus | undefined } // eslint-disable-line no-var
const CHANNEL = "sgct_live";

function bus(): Bus {
  if (!globalThis.__sgctLive) {
    const em = new EventEmitter(); em.setMaxListeners(0);
    globalThis.__sgctLive = { em, listening: null, pg: !(process.env.DATABASE_URL ?? "pglite:").startsWith("pglite:") };
  }
  return globalThis.__sgctLive;
}

/** Uma ligação dedicada por processo a ouvir o canal (só com PostgreSQL a sério). Volta a ligar se cair. */
function listen(b: Bus) {
  if (!b.pg || b.listening) return;
  b.listening = (async () => {
    const { Client } = await import("pg");
    // Volta a ligar sempre que a ligação cair ou falhar (ex.: reinício do PostgreSQL), com espera crescente até 30 s.
    let wait = 2000, retrying = false;
    const retry = () => {
      if (retrying) return; retrying = true;
      setTimeout(() => { retrying = false; void connect(); }, wait);
      wait = Math.min(wait * 2, 30_000);
    };
    const connect = async () => {
      const c = new Client({ connectionString: process.env.DATABASE_URL });
      c.on("notification", (n) => {
        try { const { to, ev } = JSON.parse(n.payload ?? "{}"); if (to && ev) b.em.emit(to, ev); } catch { /* ignorar */ }
      });
      c.on("error", () => { c.end().catch(() => null); retry(); });
      c.on("end", retry);
      try {
        await c.connect();
        await c.query(`LISTEN ${CHANNEL}`);
        wait = 2000;
      } catch { c.removeAllListeners("end"); c.end().catch(() => null); retry(); }
    };
    await connect();
  })();
}

/** Envia um evento a todos os separadores abertos de um viajante (em qualquer réplica). */
export async function publish(to: string, ev: LiveEvent) {
  const b = bus();
  if (!b.pg) { b.em.emit(to, ev); return; }
  let payload = JSON.stringify({ to, ev });
  if (payload.length > 7500) payload = JSON.stringify({ to, ev: { t: "notif" } }); // limite do NOTIFY
  const d = await db();
  await d.execute(sql`select pg_notify(${CHANNEL}, ${payload})`).catch(() => null);
}

export function subscribe(email: string, cb: (ev: LiveEvent) => void) {
  const b = bus();
  listen(b);
  b.em.on(email, cb);
  return () => { b.em.off(email, cb); };
}

/* ---------- Presença: quem tem a app aberta (para não enviar push desnecessário) ---------- */
export async function touchPresence(email: string, online = true) {
  const d = await db();
  const at = online ? new Date() : new Date(Date.now() - 120_000);
  await d.insert(schema.livePresence).values({ email, at }).onConflictDoUpdate({ target: schema.livePresence.email, set: { at } }).catch(() => null);
}
export async function isOnline(email: string) {
  const d = await db();
  const [r] = await d.select().from(schema.livePresence).where(sql`${schema.livePresence.email} = ${email}`).limit(1);
  return Boolean(r && Date.now() - r.at.getTime() < 60_000);
}
