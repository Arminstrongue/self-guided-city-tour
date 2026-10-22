/**
 * Convidar amigos para a carteira: por email (enviado pela app), por SMS/WhatsApp (enviado do telemóvel do viajante)
 * ou por link. Guardamos só um hash do contacto convidado (nunca o email/telefone de quem ainda não é cliente).
 * Quem entra por um convite segue automaticamente quem o convidou, e este recebe uma notificação.
 */
import { createHmac } from "node:crypto";
import { and, desc, eq, gt, isNotNull, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { env } from "./env";
import { sendEmail } from "./email";
import { follow, myProfile } from "./social";
import { notify } from "./notify";

export const REF_COOKIE = "sgct_ref";
export const MAX_EMAIL_INVITES_DAY = 20;

const norm = (contact: string) => {
  const c = contact.trim().toLowerCase();
  return c.includes("@") ? c : c.replace(/[^\d+]/g, "").replace(/^00/, "+");
};
export const contactHash = (contact: string) => createHmac("sha256", env.secret).update(`invite:${norm(contact)}`).digest("base64url");
export const validPhone = (p: string) => /^\+?[1-9]\d{7,14}$/.test(norm(p));

export function inviteLink(handle: string, locale: string, channel: string) {
  return `${env.appUrl}/api/i/${encodeURIComponent(handle)}?l=${locale}&c=${channel}`;
}

/** Regista um convite enviado do telemóvel (SMS/WhatsApp) ou partilhado por link. */
export async function recordInvite(me: string, channel: "sms" | "whatsapp" | "link", contact?: string) {
  const d = await db();
  await d.insert(schema.invites).values({ inviter: me, channel, targetHash: contact ? contactHash(contact) : null });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const MAIL: Record<string, { s: string; h: string; b: string; note: string; n: string }> = {
  en: { s: "{n} invited you to VOYBU", h: "Join {n}", b: "{n} is using VOYBU to explore cities on their own — routes, audio guides, a My Trip space for passes and plans and a community of travellers.", note: "Message from {n}:", n: "You got this email because {n} invited you. We won't email you again unless you sign up." },
  pt: { s: "{n} convidou-o para o VOYBU", h: "Juntar-me a {n}", b: "{n} usa o VOYBU para explorar cidades por conta própria — roteiros, áudio-guias, um espaço A minha viagem para passes e planos e uma comunidade de viajantes.", note: "Mensagem de {n}:", n: "Recebeu este email porque {n} o convidou. Não voltamos a escrever-lhe, a menos que se registe." },
  es: { s: "{n} te invitó a VOYBU", h: "Unirme a {n}", b: "{n} usa VOYBU para explorar ciudades por su cuenta: rutas, audioguías, un espacio Mi viaje para pases y planes y una comunidad de viajeros.", note: "Mensaje de {n}:", n: "Recibes este correo porque {n} te invitó. No volveremos a escribirte salvo que te registres." },
  fr: { s: "{n} vous invite sur VOYBU", h: "Rejoindre {n}", b: "{n} utilise VOYBU pour explorer les villes en autonomie : itinéraires, audioguides, un espace Mon voyage pour les pass et les plans et une communauté de voyageurs.", note: "Message de {n} :", n: "Vous recevez cet e-mail parce que {n} vous a invité. Nous ne vous écrirons plus sauf si vous vous inscrivez." }
};

/**
 * Envia convites por email. Limites: 20 por dia por viajante; o mesmo contacto não recebe outro convite
 * do mesmo viajante durante 30 dias; quem já tem perfil não recebe (mas a resposta não o revela).
 */
export async function sendEmailInvites(me: string, emails: string[], locale: string, note: string) {
  const prof = await myProfile(me);
  if (!prof) return { error: "no_profile" as const };
  const d = await db();
  const dayAgo = new Date(Date.now() - 86_400_000), monthAgo = new Date(Date.now() - 30 * 86_400_000);
  const [{ n: today }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.invites)
    .where(and(eq(schema.invites.inviter, me), eq(schema.invites.channel, "email"), gt(schema.invites.createdAt, dayAgo)));
  const list = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e !== me))];
  if (today + list.length > MAX_EMAIL_INVITES_DAY) return { error: "limit" as const, left: Math.max(0, MAX_EMAIL_INVITES_DAY - today) };
  const t = MAIL[locale] ?? MAIL.en;
  const f = (s: string) => s.replaceAll("{n}", esc(prof.name));
  let sent = 0;
  for (const email of list) {
    const h = contactHash(email);
    const recent = await d.select({ id: schema.invites.id }).from(schema.invites)
      .where(and(eq(schema.invites.inviter, me), eq(schema.invites.targetHash, h), gt(schema.invites.createdAt, monthAgo))).limit(1);
    const member = await d.select({ e: schema.travellerProfiles.email }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, email)).limit(1);
    await d.insert(schema.invites).values({ inviter: me, channel: "email", targetHash: h });
    sent++;
    if (recent.length || member.length) continue; // não insistir nem revelar quem já é membro
    const link = inviteLink(prof.handle, locale, "email");
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;color:#1d1d1f;max-width:520px">
<p style="font-weight:600;color:#0071e3">📍 VOYBU</p><h2 style="margin:0 0 12px">${f(t.s)}</h2><p>${f(t.b)}</p>
${note ? `<p style="background:#f5f5f7;border-radius:12px;padding:12px 14px"><span style="color:#6e6e73;font-size:13px">${f(t.note)}</span><br>${esc(note)}</p>` : ""}
<p><a href="${link}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;padding:12px 26px;border-radius:999px">${f(t.h)}</a></p>
<p style="color:#6e6e73;font-size:13px">${f(t.n)}</p></div>`;
    await sendEmail(email, f(t.s).replace(/&amp;/g, "&"), html, `${f(t.b)}\n${note ? `\n"${note}"\n` : ""}\n${link}`);
  }
  return { sent };
}

/** Quem convidou: estatísticas para o ecrã de convites. */
export async function inviteStats(me: string) {
  const d = await db();
  const [r] = await d.select({
    sent: sql<number>`count(*)::int`,
    joined: sql<number>`count(${schema.invites.joinedAt})::int`
  }).from(schema.invites).where(eq(schema.invites.inviter, me));
  const friends = await d.select({ handle: schema.travellerProfiles.handle, name: schema.travellerProfiles.name, photo: schema.travellerProfiles.photo, bio: schema.travellerProfiles.bio, isPrivate: schema.travellerProfiles.isPrivate })
    .from(schema.invites).innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.invites.joinedEmail))
    .where(and(eq(schema.invites.inviter, me), isNotNull(schema.invites.joinedAt))).orderBy(desc(schema.invites.joinedAt)).limit(20);
  return { sent: r?.sent ?? 0, joined: r?.joined ?? 0, friends };
}

/**
 * Quando um convidado cria o perfil: segue quem o convidou (pedido, se o perfil for privado),
 * marca o convite como aceite e avisa quem convidou.
 */
export async function acceptInvite(me: string, inviterHandle: string) {
  const d = await db();
  const [inv] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, inviterHandle.toLowerCase())).limit(1);
  if (!inv || inv.email === me) return false;
  const already = await d.select({ id: schema.invites.id }).from(schema.invites).where(eq(schema.invites.joinedEmail, me)).limit(1);
  if (already.length) return false; // só conta uma vez
  await follow(me, inv.handle).catch(() => null);
  const h = contactHash(me);
  const [match] = await d.select({ id: schema.invites.id }).from(schema.invites)
    .where(and(eq(schema.invites.inviter, inv.email), eq(schema.invites.targetHash, h), isNull(schema.invites.joinedAt))).orderBy(desc(schema.invites.createdAt)).limit(1);
  if (match) await d.update(schema.invites).set({ joinedEmail: me, joinedAt: new Date() }).where(eq(schema.invites.id, match.id));
  else await d.insert(schema.invites).values({ inviter: inv.email, channel: "link", joinedEmail: me, joinedAt: new Date() });
  await notify(inv.email, me, "invite_joined").catch(() => null);
  return true;
}

export async function purgeInvites(email: string) {
  const d = await db();
  await d.delete(schema.invites).where(eq(schema.invites.inviter, email));
  await d.update(schema.invites).set({ joinedEmail: null }).where(eq(schema.invites.joinedEmail, email));
}
