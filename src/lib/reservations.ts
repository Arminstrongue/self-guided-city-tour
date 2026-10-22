import { and, asc, eq, gte } from "drizzle-orm";
import { db, schema } from "./db";
import { zonedToDate } from "./zoned";

export const RES_KINDS = ["hotel", "ticket", "food", "transport", "tour", "other"] as const;
export type ResKind = (typeof RES_KINDS)[number];
export type Reservation = {
  id: string; kind: ResKind; title: string; city: string; localAt: string; tz: string; startsAt: string;
  place: string; lat: number | null; lng: number | null; ref: string; notes: string; photo: string; paid: boolean;
};
export type ResInput = Omit<Reservation, "id" | "startsAt">;

const row = (r: typeof schema.reservations.$inferSelect): Reservation => ({
  id: r.id, kind: r.kind as ResKind, title: r.title, city: r.city, localAt: r.localAt, tz: r.tz, startsAt: r.startsAt.toISOString(),
  place: r.place, lat: r.lat, lng: r.lng, ref: r.ref, notes: r.notes, photo: r.photo, paid: r.paid
});

/** Reservas do viajante a partir de ontem (as antigas deixam de aparecer, mas ficam até as apagar). */
export async function listReservations(email: string): Promise<Reservation[]> {
  const d = await db();
  const since = new Date(Date.now() - 24 * 3600_000);
  const rows = await d.select().from(schema.reservations).where(and(eq(schema.reservations.email, email), gte(schema.reservations.startsAt, since))).orderBy(asc(schema.reservations.startsAt)).limit(100);
  return rows.map(row);
}

export async function saveReservation(email: string, v: ResInput, id?: string): Promise<Reservation | { error: string }> {
  const startsAt = zonedToDate(v.localAt, v.tz);
  if (isNaN(startsAt.getTime())) return { error: "when" };
  const d = await db();
  const vals = { ...v, startsAt, email };
  if (id) {
    const [r] = await d.update(schema.reservations).set(vals).where(and(eq(schema.reservations.id, id), eq(schema.reservations.email, email))).returning();
    return r ? row(r) : { error: "not_found" };
  }
  const [r] = await d.insert(schema.reservations).values(vals).returning();
  return row(r);
}

export async function deleteReservation(email: string, id: string) {
  const d = await db();
  await d.delete(schema.reservations).where(and(eq(schema.reservations.id, id), eq(schema.reservations.email, email)));
}
