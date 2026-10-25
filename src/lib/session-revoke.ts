/** "Terminar sessão em todos os dispositivos" e apagar conta: sessões emitidas antes desta data deixam de valer. */
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { readAccessTokenFull } from "./access-token";

declare global { var __sgctRevoked: Map<string, { after: number; at: number }> | undefined } // eslint-disable-line no-var

/** Segundos (epoch) a partir dos quais as sessões deste email valem (cache de 30 s por processo). */
export async function sessionsAfter(email: string): Promise<number> {
  const m = (globalThis.__sgctRevoked ??= new Map());
  const c = m.get(email);
  if (c && Date.now() - c.at < 30_000) return c.after;
  const d = await db();
  const [s] = await d.select({ a: schema.accountSettings.sessionsAfter }).from(schema.accountSettings).where(eq(schema.accountSettings.email, email)).limit(1).catch(() => []);
  const after = s?.a ? Math.floor(s.a.getTime() / 1000) : 0;
  m.set(email, { after, at: Date.now() });
  return after;
}
export function forgetSessionCache(email: string) { globalThis.__sgctRevoked?.delete(email); }

/** Email de um token de viajante (cookie ou link) só se não tiver sido revogado. */
export async function validAccessEmail(token: string | undefined | null): Promise<string | null> {
  const tok = readAccessTokenFull(token);
  if (!tok) return null;
  return tok.iat >= (await sessionsAfter(tok.email)) ? tok.email : null;
}
