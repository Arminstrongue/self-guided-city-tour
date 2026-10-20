/**
 * Carteira do viajante: tudo o que é dele num só sítio, guardado na conta (identificada pelo email).
 * Passes comprados, reservas de guias, memórias com foto, lugares guardados e interesses.
 * A sessão é o mesmo cookie assinado do acesso pago (sgct_access); entra-se por link no email.
 */
import { cookies } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db";
import { ACCESS_COOKIE, createAccessToken, readAccessToken, readAccessTokenFull } from "./access-token";
import { sessionEmail } from "./auth";
import { sendEmail } from "./email";
import { env } from "./env";

declare global { var __sgctRevoked: Map<string, { after: number; at: number }> | undefined } // eslint-disable-line no-var
/** Data a partir da qual as sessões valem (cache de 30 s por processo). */
async function sessionsAfter(email: string) {
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

export async function currentTraveller(): Promise<string | null> {
  const tok = readAccessTokenFull(cookies().get(ACCESS_COOKIE)?.value);
  if (tok) return tok.iat >= (await sessionsAfter(tok.email)) ? tok.email : null;
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
    passes: accesses.map((a) => ({ id: a.id, city: a.city, scope: a.scope, plan: a.plan, amountCents: a.amountCents, createdAt: a.createdAt.toISOString(), expiresAt: a.expiresAt.toISOString(), flightAt: a.flightAt?.toISOString() ?? null, flightNo: a.flightNo })),
    bookings: bookings.map(({ b, guide, guidePhone, meeting }) => ({
      id: b.id, guideId: b.guideId, guide, city: b.city, startAt: b.startAt.toISOString(), hours: b.hours, people: b.people, amountCents: b.amountCents, status: b.status,
      // O contacto do guia só aparece depois de ele aceitar.
      ...(b.status === "confirmed" || b.status === "completed" ? { guidePhone, meeting } : {})
    })),
    memories: memories.map((m) => ({ id: m.id, city: m.city, cityName: m.cityName, title: m.title, note: m.note, photo: m.photo, lat: m.lat ? Number(m.lat) : null, lng: m.lng ? Number(m.lng) : null, at: m.takenAt.getTime() })),
    hobbies: prefs[0]?.hobbies ?? [],
    saved: prefs[0]?.saved ?? [],
    visited: prefs[0]?.visited ?? [],
    plans: plans.map((p) => ({ id: p.id, title: p.title, city: p.city, cityName: p.cityName, startDate: p.startDate, days: p.days, count: p.items.length, updatedAt: p.updatedAt.toISOString() }))
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

export async function setPrefs(email: string, p: { hobbies?: string[]; saved?: Wallet["saved"]; visited?: Wallet["visited"] }) {
  const d = await db();
  const set = { ...(p.hobbies ? { hobbies: p.hobbies } : {}), ...(p.saved ? { saved: p.saved } : {}), ...(p.visited ? { visited: p.visited } : {}), updatedAt: new Date() };
  await d.insert(schema.travellerPrefs).values({ email, hobbies: p.hobbies ?? [], saved: p.saved ?? [], visited: p.visited ?? [] })
    .onConflictDoUpdate({ target: schema.travellerPrefs.email, set });
}

const MAIL: Record<string, { s: string; h: string; b: string; n: string }> = {
  pt: { s: "A sua carteira de viagem", h: "Entrar na carteira", b: "Abra a sua carteira com os passes, reservas e memórias de viagem.", n: "Se não pediu este email, ignore-o." },
  en: { s: "Your travel wallet", h: "Open my wallet", b: "Open your wallet with your passes, bookings and travel memories.", n: "If you didn't request this email, ignore it." },
  es: { s: "Tu cartera de viaje", h: "Abrir mi cartera", b: "Abre tu cartera con tus pases, reservas y recuerdos de viaje.", n: "Si no pediste este correo, ignóralo." },
  fr: { s: "Votre portefeuille de voyage", h: "Ouvrir mon portefeuille", b: "Ouvrez votre portefeuille avec vos pass, réservations et souvenirs de voyage.", n: "Si vous n'avez pas demandé cet e-mail, ignorez-le." }
};

/** Link de entrada (vale 31 dias, igual ao link do acesso pago). */
export async function sendWalletLink(email: string, locale: string, city?: string) {
  const t = MAIL[locale] ?? MAIL.en;
  // Com cidade: depois de entrar, abre logo o roteiro dessa cidade (se tiver acesso) em vez da carteira.
  const link = `${env.appUrl}/api/access/link?token=${encodeURIComponent(createAccessToken(email))}&locale=${locale}${city ? `&city=${city}` : "&to=wallet"}`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;color:#1d1d1f;max-width:520px">
<p style="font-weight:600;color:#0071e3">📍 Self Guided City Tour</p><h2 style="margin:0 0 12px">${t.s}</h2><p>${t.b}</p>
<p><a href="${link}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;padding:12px 26px;border-radius:999px">${t.h}</a></p>
<p style="color:#6e6e73;font-size:13px">${t.n}</p></div>`;
  await sendEmail(email, `Self Guided City Tour — ${t.s}`, html, `${t.b}\n${link}`);
  return link;
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
