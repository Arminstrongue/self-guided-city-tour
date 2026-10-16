import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { CITIES, type City } from "@/data/cities";

/** Validação do conteúdo de uma cidade editado no painel. */
const Leg = z.object({
  m: z.enum(["walk", "metro", "tram", "bus", "train"]),
  min: z.number().int().min(0).max(240),
  line: z.string().max(120).optional().default(""),
  r: z.number().int().min(0).max(10).optional(),
  f: z.number().min(0).max(100).optional()
});
const Stop = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  n: z.string().min(2).max(80), a: z.string().max(60),
  lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  v: z.number().int().min(5).max(240),
  top: z.boolean().optional(), x: z.boolean().optional(), o: z.boolean().optional(),
  c: z.number().min(0).max(200).optional(),
  leg: Leg, pt: z.string().max(600), en: z.string().max(600)
});
const Alt = z.union([
  z.object({ type: z.literal("pass"), price: z.number().min(0), name: z.string().max(60), includesAirport: z.boolean().optional() }),
  z.object({ type: z.literal("pack"), price: z.number().min(0), n: z.number().int().min(2).max(50), name: z.string().max(60) }),
  z.object({ type: z.literal("cap"), price: z.number().min(0), name: z.string().max(60) })
]);
export const CitySchema = z.object({
  id: z.string().regex(/^[a-z]{2,5}$/),
  n: z.object({ pt: z.string().min(2), en: z.string().min(2), es: z.string().min(2), fr: z.string().min(2), de: z.string().min(2) }),
  cur: z.enum(["EUR", "GBP"]),
  single: z.number().min(0).max(50), card: z.number().min(0).max(20), cardName: z.string().max(40),
  alt: Alt.nullable(),
  air: Leg, ret: z.object({ core: Leg, extra: Leg }),
  stops: z.array(Stop).min(3).max(15)
}).superRefine((c, ctx) => {
  const ids = new Set<string>();
  c.stops.forEach((s, i) => { if (ids.has(s.id)) ctx.addIssue({ code: "custom", path: ["stops", i, "id"], message: "duplicate stop id" }); ids.add(s.id); });
});

type Row = typeof schema.cityContent.$inferSelect;

async function rows(): Promise<Row[]> {
  try { const d = await db(); return await d.select().from(schema.cityContent); }
  catch { return []; } // base de dados ainda sem a tabela: usa o conteúdo de origem
}

/** Cidades ativas: conteúdo de origem com as alterações feitas no painel por cima. */
export async function loadCities(opts: { includeInactive?: boolean } = {}): Promise<(City & { edited?: boolean; active?: boolean })[]> {
  const over = new Map((await rows()).map((r) => [r.id, r]));
  const out: (City & { edited?: boolean; active?: boolean })[] = CITIES.map((c) => {
    const r = over.get(c.id);
    return r ? { ...(r.data as City), edited: true, active: r.active } : { ...c, active: true };
  });
  for (const r of over.values()) if (!CITIES.some((c) => c.id === r.id)) out.push({ ...(r.data as City), edited: true, active: r.active });
  return opts.includeInactive ? out : out.filter((c) => c.active !== false);
}

export async function loadCity(id: string): Promise<City | undefined> {
  return (await loadCities()).find((c) => c.id === id);
}

export async function saveCity(input: unknown, active: boolean, by: string): Promise<City> {
  const city = CitySchema.parse(input) as City;
  const d = await db();
  await d.insert(schema.cityContent).values({ id: city.id, data: city, active, updatedBy: by, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.cityContent.id, set: { data: city, active, updatedBy: by, updatedAt: new Date() } });
  return city;
}

/** Remove as alterações e volta ao conteúdo de origem. */
export async function resetCity(id: string): Promise<void> {
  const d = await db();
  await d.delete(schema.cityContent).where(eq(schema.cityContent.id, id));
}
