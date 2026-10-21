/** Comentários sobre uma cidade (stop = "") ou um lugar do roteiro. Qualquer viajante com perfil pode comentar. */
import { and, desc, eq, gte, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { moderate } from "./moderation";
import { loadCities } from "./content";
import { isAdminEmail } from "./auth";

export const MAX_COMMENTS_DAY = 20;
const pub = (p: schema.TravellerProfile) => ({ handle: p.handle, name: p.name, bio: p.bio, photo: p.photo, isPrivate: p.isPrivate });

async function blockedFor(me: string | null) {
  if (!me) return new Set<string>();
  const d = await db();
  const b = await d.select().from(schema.blocks).where(or(eq(schema.blocks.blocker, me), eq(schema.blocks.blocked, me)));
  return new Set(b.map((x) => (x.blocker === me ? x.blocked : x.blocker)));
}

export async function listComments(me: string | null, city: string, stop: string, before?: string | null) {
  const d = await db();
  const rows = await d.select({ c: schema.placeComments, a: schema.travellerProfiles }).from(schema.placeComments)
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.placeComments.author))
    .where(and(eq(schema.placeComments.city, city), eq(schema.placeComments.stop, stop), eq(schema.placeComments.hidden, false), before ? sql`${schema.placeComments.createdAt} < ${new Date(before)}` : undefined))
    .orderBy(desc(schema.placeComments.createdAt)).limit(31);
  const blocked = await blockedFor(me);
  const admin = isAdminEmail(me);
  const items = rows.slice(0, 30).filter((r) => !blocked.has(r.c.author)).map((r) => ({
    id: r.c.id, text: r.c.text, at: r.c.createdAt.toISOString(), author: pub(r.a), mine: r.c.author === me, canDelete: r.c.author === me || admin
  }));
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.placeComments).where(and(eq(schema.placeComments.city, city), eq(schema.placeComments.stop, stop), eq(schema.placeComments.hidden, false)));
  return { items, total: n, next: rows.length > 30 ? rows[29].c.createdAt.toISOString() : null };
}

/** Quantos comentários tem cada paragem de uma cidade (para os contadores no roteiro). */
export async function commentCounts(city: string) {
  const d = await db();
  const r = await d.select({ stop: schema.placeComments.stop, n: sql<number>`count(*)::int` }).from(schema.placeComments)
    .where(and(eq(schema.placeComments.city, city), eq(schema.placeComments.hidden, false))).groupBy(schema.placeComments.stop);
  return Object.fromEntries(r.map((x) => [x.stop, x.n])) as Record<string, number>;
}

export async function addComment(me: string, city: string, stop: string, raw: string) {
  const c = (await loadCities()).find((x) => x.id === city);
  if (!c || (stop && !c.stops.some((s) => s.id === stop))) return { error: "unknown" as const };
  const d = await db();
  const [prof] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, me)).limit(1);
  if (!prof) return { error: "no_profile" as const };
  const text = raw.trim().slice(0, 600);
  if (!text) return { error: "empty" as const };
  const m = moderate(text);
  if (!m.ok) return { error: "offensive" as const };
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.placeComments).where(and(eq(schema.placeComments.author, me), gte(schema.placeComments.createdAt, new Date(Date.now() - 86400_000))));
  if (n >= MAX_COMMENTS_DAY) return { error: "limit" as const };
  // O mesmo texto duas vezes em 10 min (duplo toque, rede lenta) não duplica.
  const [dup] = await d.select().from(schema.placeComments).where(and(eq(schema.placeComments.author, me), eq(schema.placeComments.city, city), eq(schema.placeComments.stop, stop), eq(schema.placeComments.text, m.text), gte(schema.placeComments.createdAt, new Date(Date.now() - 600_000)))).limit(1);
  if (dup) return { id: dup.id, text: dup.text, at: dup.createdAt.toISOString(), author: pub(prof), mine: true, canDelete: true };
  const [row] = await d.insert(schema.placeComments).values({ city, stop, author: me, text: m.text }).returning();
  return { id: row.id, text: row.text, at: row.createdAt.toISOString(), author: pub(prof), mine: true, canDelete: true };
}

export async function deleteComment(me: string, id: string) {
  const d = await db();
  const where = isAdminEmail(me) ? eq(schema.placeComments.id, id) : and(eq(schema.placeComments.id, id), eq(schema.placeComments.author, me));
  const r = await d.delete(schema.placeComments).where(where).returning({ id: schema.placeComments.id });
  return r.length > 0;
}

/** Denunciar: fica na caixa do admin; com 3 denúncias o comentário esconde-se até ser revisto. */
export async function reportComment(me: string, id: string, reason: string) {
  const d = await db();
  const [c] = await d.select().from(schema.placeComments).where(eq(schema.placeComments.id, id)).limit(1);
  if (!c || c.author === me) return false;
  const dup = await d.select({ id: schema.reports.id }).from(schema.reports).where(and(eq(schema.reports.reporter, me), eq(schema.reports.note, `place-comment:${id}`))).limit(1);
  if (dup.length) return true;
  await d.insert(schema.reports).values({ reporter: me, target: c.author, reason, note: `place-comment:${id}` });
  await d.update(schema.placeComments).set({ reports: sql`${schema.placeComments.reports} + 1`, hidden: sql`${schema.placeComments.reports} + 1 >= 3` }).where(eq(schema.placeComments.id, id));
  return true;
}

export async function recentCityComments(cities: string[], since: Date) {
  const d = await db();
  return d.select({ city: schema.placeComments.city, n: sql<number>`count(*)::int` }).from(schema.placeComments)
    .where(and(inArray(schema.placeComments.city, cities.length ? cities : ["~"]), gte(schema.placeComments.createdAt, since), eq(schema.placeComments.hidden, false))).groupBy(schema.placeComments.city);
}
