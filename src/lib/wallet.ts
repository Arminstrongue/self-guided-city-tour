/**
 * Carteira do viajante: tudo o que é dele num só sítio, guardado na conta (identificada pelo email).
 * Passes comprados, reservas de guias, memórias com foto, lugares guardados e interesses.
 * A sessão é o mesmo cookie assinado do acesso pago (sgct_access); entra-se por link no email.
 */
import { cookies } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db";
import { ACCESS_COOKIE, createAccessToken, createSignInCode, readAccessTokenFull } from "./access-token";
import { sessionEmail } from "./auth";
import { validAccessEmail } from "./session-revoke";
import { sendEmail } from "./email";
import { signinEmail } from "./signin-email";
import { env } from "./env";

export { forgetSessionCache } from "./session-revoke";

export async function currentTraveller(): Promise<string | null> {
  const raw = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (raw && readAccessTokenFull(raw)) return validAccessEmail(raw);
  return await sessionEmail().catch(() => null);
}

export const MAX_MEMORIES = 500;

export async function walletFor(email: string) {
  const d = await db();
  const [accesses, bookings, memories, prefs, plans] = await Promise.all([
    d.select().from(schema.accesses).where(eq(schema.accesses.email, email)).orderBy(desc(schema.accesses.createdAt)).limit(50),
    d.select({ b: schema.guideBookings, guide: schema.guides.name, guidePhone: schema.guides.phone, meeting: schema.guides.meetingPoint })
      .from(schema.guideBookings).innerJoin(schema.guides, eq(schema.guides.id, schema.guideBookings.guideId))
      .where(and(eq(schema.guideBookings.email, email), inArray(schema.guideBookings.status, ["requested", "confirmed", "completed", "declined", "expired"])))
      .orderBy(desc(schema.guideBookings.startAt)).limit(50),
    d.select().from(schema.travellerMemories).where(eq(schema.travellerMemories.email, email)).orderBy(desc(schema.travellerMemories.takenAt)).limit(MAX_MEMORIES),
    d.select().from(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, email)).limit(1),
    d.select().from(schema.travellerPlans).where(eq(schema.travellerPlans.email, email)).orderBy(desc(schema.travellerPlans.updatedAt)).limit(100)
  ]);
  return {
    email,
    passes: accesses.map((a) => ({ id: a.id, city: a.city, scope: a.scope, plan: a.plan, amountCents: a.amountCents, createdAt: a.createdAt.toISOString(), expiresAt: a.expiresAt.toISOString(), activatedAt: a.activatedAt?.toISOString() ?? null, flightAt: a.flightAt?.toISOString() ?? null, flightNo: a.flightNo })),
    bookings: bookings.map(({ b, guide, guidePhone, meeting }) => ({
      id: b.id, guideId: b.guideId, guide, city: b.city, startAt: b.startAt.toISOString(), hours: b.hours, people: b.people, amountCents: b.amountCents, status: b.status,
      // O contacto do guia só aparece depois de ele aceitar.
      ...(b.status === "confirmed" || b.status === "completed" ? { guidePhone, meeting } : {})
    })),
    memories: memories.map((m) => ({ id: m.id, city: m.city, cityName: m.cityName, title: m.title, note: m.note, photo: m.photo, lat: m.lat ? Number(m.lat) : null, lng: m.lng ? Number(m.lng) : null, at: m.takenAt.getTime() })),
    hobbies: prefs[0]?.hobbies ?? [],
    travel: (prefs[0]?.travel ?? {}) as import("./db/schema").TravelPrefs,
    saved: prefs[0]?.saved ?? [],
    visited: prefs[0]?.visited ?? [],
    plans: plans.map((p) => ({ id: p.id, title: p.title, city: p.city, cityName: p.cityName, startDate: p.startDate, days: p.days, count: p.items.length, updatedAt: p.updatedAt.toISOString(),
      // Para o cartão: primeiros lugares (por dia e hora) e pontos para abrir o percurso no mapa.
      preview: [...p.items].sort((a, b) => a.day - b.day || (a.time ?? "99").localeCompare(b.time ?? "99")).slice(0, 3).map((i) => ({ icon: i.icon ?? "📍", title: i.title.slice(0, 40) })),
      pts: [...p.items].sort((a, b) => a.day - b.day || (a.time ?? "99").localeCompare(b.time ?? "99")).filter((i) => Number.isFinite(i.lat) && Number.isFinite(i.lng)).slice(0, 10).map((i) => ({ lat: i.lat as number, lng: i.lng as number })) }))
  };
}
export type Wallet = Awaited<ReturnType<typeof walletFor>>;

export async function addMemory(email: string, m: { city: string; cityName: string; title: string; note: string; photo: string | null; lat: number | null; lng: number | null; at?: number }) {
  const d = await db();
  const [row] = await d.insert(schema.travellerMemories).values({
    email, city: m.city, cityName: m.cityName, title: m.title, note: m.note, photo: m.photo,
    lat: m.lat === null ? null : String(m.lat), lng: m.lng === null ? null : String(m.lng), ...(m.at ? { takenAt: new Date(m.at) } : {})
  }).returning({ id: schema.travellerMemories.id });
  return row.id;
}

export async function removeMemory(email: string, id: string) {
  const d = await db();
  await d.delete(schema.travellerMemories).where(and(eq(schema.travellerMemories.id, id), eq(schema.travellerMemories.email, email)));
}

export async function setPrefs(email: string, p: { hobbies?: string[]; saved?: Wallet["saved"]; visited?: Wallet["visited"]; travel?: import("./db/schema").TravelPrefs }) {
  const d = await db();
  const set = { ...(p.hobbies ? { hobbies: p.hobbies } : {}), ...(p.saved ? { saved: p.saved } : {}), ...(p.visited ? { visited: p.visited } : {}), ...(p.travel ? { travel: p.travel } : {}), updatedAt: new Date() };
  await d.insert(schema.travellerPrefs).values({ email, hobbies: p.hobbies ?? [], saved: p.saved ?? [], visited: p.visited ?? [], travel: p.travel ?? {} })
    .onConflictDoUpdate({ target: schema.travellerPrefs.email, set });
}


/** Link de entrada + código de 6 dígitos: valem 30 minutos; ao abrir o link, o servidor cria uma sessão nova (o link nunca é a sessão). */
export async function sendWalletLink(email: string, locale: string, city?: string) {
  // Com cidade: depois de entrar, abre logo o roteiro dessa cidade (se tiver acesso) em vez da carteira.
  const link = `${env.appUrl}/api/access/link?token=${encodeURIComponent(createAccessToken(email, 30 * 60))}&locale=${locale}${city ? `&city=${city}` : "&to=wallet"}`;
  const { code, challenge } = createSignInCode(email);
  const m = signinEmail({ locale, email, link, code });
  const sent = await sendEmail(email, m.subject, m.html, m.text);
  return { link, code, challenge, sent };
}

/* ---------- Planos de viagem ---------- */
export async function listPlans(email: string) {
  const d = await db();
  return d.select().from(schema.travellerPlans).where(eq(schema.travellerPlans.email, email)).orderBy(desc(schema.travellerPlans.updatedAt)).limit(100);
}
export async function getPlan(email: string, id: string) {
  const d = await db();
  const [p] = await d.select().from(schema.travellerPlans).where(and(eq(schema.travellerPlans.id, id), eq(schema.travellerPlans.email, email))).limit(1);
  return p ?? null;
}
export async function createPlan(email: string, p: { title: string; city: string | null; cityName: string; startDate: string | null; days: number; items?: schema.PlanItem[] }) {
  const d = await db();
  const [row] = await d.insert(schema.travellerPlans).values({ email, ...p, items: p.items ?? [] }).returning({ id: schema.travellerPlans.id });
  return row.id;
}
export async function updatePlan(email: string, id: string, p: Partial<{ title: string; startDate: string | null; days: number; items: schema.PlanItem[] }>) {
  const d = await db();
  await d.update(schema.travellerPlans).set({ ...p, updatedAt: new Date() }).where(and(eq(schema.travellerPlans.id, id), eq(schema.travellerPlans.email, email)));
}
export async function deletePlan(email: string, id: string) {
  const d = await db();
  await d.delete(schema.travellerPlans).where(and(eq(schema.travellerPlans.id, id), eq(schema.travellerPlans.email, email)));
}
