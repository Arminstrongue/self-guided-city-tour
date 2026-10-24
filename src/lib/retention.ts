/**
 * Prazos de conservação (Política de privacidade): o que já não é preciso sai ou fica anónimo.
 * Corre no worker uma vez por dia. As compras ficam (registos fiscais), mas sem voo nem plano de viagem.
 */
import { and, isNotNull, lt, ne, or } from "drizzle-orm";
import { db, schema } from "./db";

const DAY = 86_400_000;
export const RETENTION = {
  bookingRequestsDays: 365,   // pedidos a negócios: anónimos ao fim de 12 meses
  notificationsDays: 365,     // avisos na app
  stopReporterDays: 365,      // quem reportou um problema numa paragem
  moderationDays: 730,        // denúncias de perfis/publicações
  eventsDays: 760,            // contagens anónimas do funil (~25 meses)
  tripAfterExpiryDays: 90,    // voo e plano de viagem da compra, depois de o passe acabar
  presenceDays: 2             // "online agora"
};

export async function purgeOld(now = Date.now()) {
  const d = await db();
  const ago = (days: number) => new Date(now - days * DAY);
  const out: Record<string, number> = {};
  const n = (r: unknown) => (Array.isArray(r) ? r.length : 0);
  out.bookingRequests = n(await d.update(schema.bookingRequests).set({ name: "", email: "", phone: "", note: "" })
    .where(and(lt(schema.bookingRequests.createdAt, ago(RETENTION.bookingRequestsDays)), ne(schema.bookingRequests.email, ""))).returning({ id: schema.bookingRequests.id }));
  out.notifications = n(await d.delete(schema.notifications).where(lt(schema.notifications.createdAt, ago(RETENTION.notificationsDays))).returning({ id: schema.notifications.id }));
  out.stopReporters = n(await d.update(schema.stopReports).set({ reporter: "" })
    .where(and(lt(schema.stopReports.createdAt, ago(RETENTION.stopReporterDays)), ne(schema.stopReports.reporter, ""))).returning({ id: schema.stopReports.id }));
  out.reports = n(await d.delete(schema.reports).where(lt(schema.reports.createdAt, ago(RETENTION.moderationDays))).returning({ id: schema.reports.id }));
  out.events = n(await d.delete(schema.events).where(lt(schema.events.createdAt, ago(RETENTION.eventsDays))).returning({ id: schema.events.id }));
  out.trips = n(await d.update(schema.accesses).set({ flightNo: null, flightAt: null, trip: null })
    .where(and(lt(schema.accesses.expiresAt, ago(RETENTION.tripAfterExpiryDays)), or(isNotNull(schema.accesses.flightNo), isNotNull(schema.accesses.trip), isNotNull(schema.accesses.flightAt)))).returning({ id: schema.accesses.id }));
  out.presence = n(await d.delete(schema.livePresence).where(lt(schema.livePresence.at, ago(RETENTION.presenceDays))).returning({ email: schema.livePresence.email }));
  return out;
}
