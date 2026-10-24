/** Percursos do registo automático: só chegam ao servidor depois de o viajante os confirmar. */
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "./db";

export const MAX_PATH = 300;
export const JourneyBody = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().regex(/^[a-z]{2,12}$/).nullable().default(null),
  cityName: z.string().trim().max(80).default(""),
  km: z.number().min(0).max(200),
  steps: z.number().int().min(0).max(150_000),
  places: z.array(z.object({ name: z.string().trim().min(1).max(80), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), stop: z.string().max(40).optional() })).max(60).default([]),
  path: z.array(z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)])).max(MAX_PATH).default([])
});
export type JourneyInput = z.infer<typeof JourneyBody>;

/** Guarda (ou junta ao do mesmo dia e cidade) — confirmar duas vezes não duplica km nem passos. */
export async function saveJourney(email: string, j: JourneyInput) {
  const d = await db();
  const [cur] = await d.select().from(schema.journeys).where(and(eq(schema.journeys.email, email), eq(schema.journeys.day, j.day), j.city ? eq(schema.journeys.city, j.city) : sql`${schema.journeys.city} is null`)).limit(1);
  if (cur) {
    const names = new Set(cur.places.map((p) => p.name));
    await d.update(schema.journeys).set({
      km: Math.max(cur.km, j.km), steps: Math.max(cur.steps, j.steps),
      places: [...cur.places, ...j.places.filter((p) => !names.has(p.name))].slice(0, 60),
      path: (j.path.length > cur.path.length ? j.path : cur.path).slice(0, MAX_PATH)
    }).where(eq(schema.journeys.id, cur.id));
    return cur.id;
  }
  const [row] = await d.insert(schema.journeys).values({ email, ...j }).returning({ id: schema.journeys.id });
  return row.id;
}
export async function listJourneys(email: string) {
  const d = await db();
  return d.select().from(schema.journeys).where(eq(schema.journeys.email, email)).orderBy(desc(schema.journeys.day), desc(schema.journeys.createdAt)).limit(60);
}
export async function deleteJourney(email: string, id: string) {
  const d = await db();
  await d.delete(schema.journeys).where(and(eq(schema.journeys.id, id), eq(schema.journeys.email, email)));
}
