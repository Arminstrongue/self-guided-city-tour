/**
 * Carteira do viajante: tudo o que é dele num só sítio, guardado na conta (identificada pelo email).
 * Passes comprados, reservas de guias, memórias com foto, lugares guardados e interesses.
 * A sessão é o mesmo cookie assinado do acesso pago (sgct_access); entra-se por link no email.
 */
import { cookies } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db";
import { ACCESS_COOKIE, createAccessToken, readAccessToken } from "./access-token";
import { sessionEmail } from "./auth";
import { sendEmail } from "./email";
import { env } from "./env";

export async function currentTraveller(): Promise<string | null> {
  const fromCookie = readAccessToken(cookies().get(ACCESS_COOKIE)?.value);
  return fromCookie ?? (await sessionEmail().catch(() => null));
}

export const MAX_MEMORIES = 500;

export async function walletFor(email: string) {
  const d = await db();
  const [accesses, bookings, memories, prefs] = await Promise.all([
    d.select().from(schema.accesses).where(eq(schema.accesses.email, email)).orderBy(desc(schema.accesses.createdAt)).limit(50),
    d.select({ b: schema.guideBookings, guide: schema.guides.name, guidePhone: schema.guides.phone, meeting: schema.guides.meetingPoint })
      .from(schema.guideBookings).innerJoin(schema.guides, eq(schema.guides.id, schema.guideBookings.guideId))
      .where(and(eq(schema.guideBookings.email, email), inArray(schema.guideBookings.status, ["requested", "confirmed", "completed", "declined", "expired"])))
      .orderBy(desc(schema.guideBookings.startAt)).limit(50),
    d.select().from(schema.travellerMemories).where(eq(schema.travellerMemories.email, email)).orderBy(desc(schema.travellerMemories.takenAt)).limit(MAX_MEMORIES),
    d.select().from(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, email)).limit(1)
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
    saved: prefs[0]?.saved ?? []
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

export async function setPrefs(email: string, p: { hobbies?: string[]; saved?: Wallet["saved"] }) {
  const d = await db();
  const set = { ...(p.hobbies ? { hobbies: p.hobbies } : {}), ...(p.saved ? { saved: p.saved } : {}), updatedAt: new Date() };
  await d.insert(schema.travellerPrefs).values({ email, hobbies: p.hobbies ?? [], saved: p.saved ?? [] })
    .onConflictDoUpdate({ target: schema.travellerPrefs.email, set });
}

const MAIL: Record<string, { s: string; h: string; b: string; n: string }> = {
  pt: { s: "A sua carteira de viagem", h: "Entrar na carteira", b: "Abra a sua carteira com os passes, reservas e memórias de viagem.", n: "Se não pediu este email, ignore-o." },
  en: { s: "Your travel wallet", h: "Open my wallet", b: "Open your wallet with your passes, bookings and travel memories.", n: "If you didn't request this email, ignore it." },
  es: { s: "Tu cartera de viaje", h: "Abrir mi cartera", b: "Abre tu cartera con tus pases, reservas y recuerdos de viaje.", n: "Si no pediste este correo, ignóralo." },
  fr: { s: "Votre portefeuille de voyage", h: "Ouvrir mon portefeuille", b: "Ouvrez votre portefeuille avec vos pass, réservations et souvenirs de voyage.", n: "Si vous n'avez pas demandé cet e-mail, ignorez-le." }
};

/** Link de entrada (vale 31 dias, igual ao link do acesso pago). */
export async function sendWalletLink(email: string, locale: string) {
  const t = MAIL[locale] ?? MAIL.en;
  const link = `${env.appUrl}/api/access/link?token=${encodeURIComponent(createAccessToken(email))}&locale=${locale}&to=wallet`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;color:#1d1d1f;max-width:520px">
<p style="font-weight:600;color:#0071e3">📍 Self Guided City Tour</p><h2 style="margin:0 0 12px">${t.s}</h2><p>${t.b}</p>
<p><a href="${link}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;padding:12px 26px;border-radius:999px">${t.h}</a></p>
<p style="color:#6e6e73;font-size:13px">${t.n}</p></div>`;
  await sendEmail(email, `Self Guided City Tour — ${t.s}`, html, `${t.b}\n${link}`);
  return link;
}
