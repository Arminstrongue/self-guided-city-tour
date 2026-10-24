/**
 * Gestão da conta do viajante: exportar os dados (RGPD, art. 20.º) e apagar a conta.
 * Compras (passes) e reservas de guias ficam guardadas, sem perfil, porque a lei obriga a manter registos fiscais.
 */
import { eq, inArray, or } from "drizzle-orm";
import { db, schema } from "./db";
import { deleteProfile } from "./social";
import { settingsOf } from "./notify";

export async function exportData(email: string) {
  const d = await db();
  const [profile, prefs, plans, memories, posts, comments, likes, follows, blocks, sent, received, accesses, bookings, notifs, settings, journeys] = await Promise.all([
    d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, email)),
    d.select().from(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, email)),
    d.select().from(schema.travellerPlans).where(eq(schema.travellerPlans.email, email)),
    d.select({ id: schema.travellerMemories.id, city: schema.travellerMemories.city, title: schema.travellerMemories.title, note: schema.travellerMemories.note, takenAt: schema.travellerMemories.takenAt, lat: schema.travellerMemories.lat, lng: schema.travellerMemories.lng })
      .from(schema.travellerMemories).where(eq(schema.travellerMemories.email, email)),
    d.select({ id: schema.posts.id, kind: schema.posts.kind, text: schema.posts.text, city: schema.posts.city, tag: schema.posts.tag, createdAt: schema.posts.createdAt }).from(schema.posts).where(eq(schema.posts.author, email)),
    d.select({ postId: schema.postComments.postId, text: schema.postComments.text, createdAt: schema.postComments.createdAt }).from(schema.postComments).where(eq(schema.postComments.author, email)),
    d.select({ postId: schema.postLikes.postId, createdAt: schema.postLikes.createdAt }).from(schema.postLikes).where(eq(schema.postLikes.email, email)),
    d.select({ follower: schema.follows.follower, followee: schema.follows.followee, status: schema.follows.status }).from(schema.follows).where(or(eq(schema.follows.follower, email), eq(schema.follows.followee, email))),
    d.select({ blocked: schema.blocks.blocked }).from(schema.blocks).where(eq(schema.blocks.blocker, email)),
    d.select({ to: schema.messages.recipient, text: schema.messages.text, at: schema.messages.createdAt }).from(schema.messages).where(eq(schema.messages.sender, email)),
    d.select({ from: schema.messages.sender, text: schema.messages.text, at: schema.messages.createdAt }).from(schema.messages).where(eq(schema.messages.recipient, email)),
    d.select({ city: schema.accesses.city, plan: schema.accesses.plan, amountCents: schema.accesses.amountCents, createdAt: schema.accesses.createdAt, expiresAt: schema.accesses.expiresAt }).from(schema.accesses).where(eq(schema.accesses.email, email)),
    d.select({ city: schema.guideBookings.city, startAt: schema.guideBookings.startAt, hours: schema.guideBookings.hours, status: schema.guideBookings.status, amountCents: schema.guideBookings.amountCents }).from(schema.guideBookings).where(eq(schema.guideBookings.email, email)),
    d.select({ type: schema.notifications.type, text: schema.notifications.text, createdAt: schema.notifications.createdAt }).from(schema.notifications).where(eq(schema.notifications.email, email)),
    settingsOf(email),
    d.select({ day: schema.journeys.day, city: schema.journeys.cityName, km: schema.journeys.km, steps: schema.journeys.steps, places: schema.journeys.places, path: schema.journeys.path }).from(schema.journeys).where(eq(schema.journeys.email, email))
  ]);
  // Também: reservas e bilhetes, check-ins, comentários em lugares, pedidos a negócios e a conta de login.
  const [reservations, checkins, placeComments, businessRequests, account] = await Promise.all([
    d.select().from(schema.reservations).where(eq(schema.reservations.email, email)),
    d.select({ city: schema.checkins.city, stop: schema.checkins.stop, verified: schema.checkins.verified, at: schema.checkins.createdAt }).from(schema.checkins).where(eq(schema.checkins.email, email)),
    d.select({ city: schema.placeComments.city, stop: schema.placeComments.stop, text: schema.placeComments.text, at: schema.placeComments.createdAt }).from(schema.placeComments).where(eq(schema.placeComments.author, email)),
    d.select({ kind: schema.bookingRequests.kind, option: schema.bookingRequests.option, dateFrom: schema.bookingRequests.dateFrom, dateTo: schema.bookingRequests.dateTo, name: schema.bookingRequests.name, phone: schema.bookingRequests.phone, note: schema.bookingRequests.note, status: schema.bookingRequests.status, at: schema.bookingRequests.createdAt }).from(schema.bookingRequests).where(eq(schema.bookingRequests.email, email)),
    d.select({ name: schema.users.name, provider: schema.users.provider, locale: schema.users.locale, createdAt: schema.users.createdAt }).from(schema.users).where(eq(schema.users.email, email))
  ]);
  // Os outros viajantes aparecem pelo @nome, nunca pelo email.
  const handles = new Map((await d.select({ e: schema.travellerProfiles.email, h: schema.travellerProfiles.handle }).from(schema.travellerProfiles)).map((r) => [r.e, `@${r.h}`]));
  const who = (e: string) => (e === email ? "me" : handles.get(e) ?? "(deleted traveller)");
  return {
    exportedAt: new Date().toISOString(), email,
    profile: profile[0] ? { ...profile[0], email: undefined } : null,
    settings: { dmPolicy: settings.dmPolicy, notifications: settings.notif, language: settings.lang },
    preferences: prefs[0] ?? null, plans, memories, posts, comments, likes,
    follows: follows.map((f) => ({ follower: who(f.follower), following: who(f.followee), status: f.status })),
    blocked: blocks.map((b) => who(b.blocked)),
    messagesSent: sent.map((m) => ({ to: who(m.to), text: m.text, at: m.at })),
    messagesReceived: received.map((m) => ({ from: who(m.from), text: m.text, at: m.at })),
    purchases: accesses, guideBookings: bookings, notifications: notifs, journeys, reservations, checkins, placeComments, businessRequests, account: account[0] ?? null
  };
}

/** Apaga a conta: perfil, publicações, conversas, notificações, memórias, planos, reservas e preferências. */
export async function deleteAccount(email: string) {
  const d = await db();
  await deleteProfile(email); // perfil + publicações + conversas + notificações + push
  await d.delete(schema.blocks).where(or(eq(schema.blocks.blocker, email), eq(schema.blocks.blocked, email)));
  await d.delete(schema.travellerMemories).where(eq(schema.travellerMemories.email, email));
  await d.delete(schema.travellerPlans).where(eq(schema.travellerPlans.email, email));
  await d.delete(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, email));
  await (await import("./invites")).purgeInvites(email);
  await (await import("./referrals")).purgeReferrals(email);
  await (await import("./points")).purgePoints(email);
  await (await import("./achievements")).purgeAchievements(email);
  await (await import("./split")).purgeSplit(email);
  await d.delete(schema.reservations).where(eq(schema.reservations.email, email));
  await d.delete(schema.journeys).where(eq(schema.journeys.email, email));
  await d.update(schema.stopReports).set({ reporter: "" }).where(eq(schema.stopReports.reporter, email));
  // Restos sociais e pedidos a negócios (antes ficavam para trás).
  await d.delete(schema.closeFriends).where(or(eq(schema.closeFriends.email, email), eq(schema.closeFriends.friend, email)));
  await d.delete(schema.highlights).where(eq(schema.highlights.author, email));
  await d.delete(schema.postHides).where(eq(schema.postHides.email, email));
  await d.delete(schema.userMutes).where(or(eq(schema.userMutes.email, email), eq(schema.userMutes.muted, email)));
  await d.delete(schema.messageReactions).where(eq(schema.messageReactions.email, email));
  await d.delete(schema.reports).where(or(eq(schema.reports.reporter, email), eq(schema.reports.target, email)));
  await d.update(schema.bookingRequests).set({ name: "", email: "", phone: "", note: "" }).where(eq(schema.bookingRequests.email, email));
  // Avaliações de guias: ficam as estrelas e o comentário, sem o nome.
  const myBookings = (await d.select({ id: schema.guideBookings.id }).from(schema.guideBookings).where(eq(schema.guideBookings.email, email))).map((r) => r.id);
  if (myBookings.length) await d.update(schema.guideReviews).set({ author: null }).where(inArray(schema.guideReviews.bookingId, myBookings));
  // Compras: só ficam os dados que a lei fiscal obriga a guardar (sem voo nem plano de viagem).
  await d.update(schema.accesses).set({ flightNo: null, flightAt: null, trip: null, userId: null }).where(eq(schema.accesses.email, email));
  await d.delete(schema.users).where(eq(schema.users.email, email));
  // As sessões antigas deixam de valer (se o mesmo email voltar, começa do zero).
  await d.insert(schema.accountSettings).values({ email, sessionsAfter: new Date() })
    .onConflictDoUpdate({ target: schema.accountSettings.email, set: { sessionsAfter: new Date(), notif: {}, dmPolicy: "circle", updatedAt: new Date() } });
}
