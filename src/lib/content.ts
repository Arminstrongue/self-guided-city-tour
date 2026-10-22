import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { CITIES, type City } from "@/data/cities";

/** Validação do conteúdo de uma cidade editado no painel. Limites de preço largos para moedas como a lira turca. */
const MONEY = 100_000;
const Leg = z.object({
  m: z.enum(["walk", "metro", "tram", "bus", "train", "ferry", "car"]),
  min: z.number().int().min(0).max(240),
  line: z.string().max(120).optional().default(""),
  r: z.number().int().min(0).max(10).optional(),
  f: z.number().min(0).max(MONEY).optional()
});
const Stop = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  n: z.string().min(2).max(80), a: z.string().max(60),
  lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  v: z.number().int().min(5).max(240),
  top: z.boolean().optional(), x: z.boolean().optional(), o: z.boolean().optional(),
  c: z.number().min(0).max(MONEY).optional(),
  leg: Leg, pt: z.string().max(600), en: z.string().max(600),
  cl: z.array(z.number().int().min(0).max(6)).max(7).optional()
});
const Alt = z.union([
  z.object({ type: z.literal("pass"), price: z.number().min(0).max(MONEY), name: z.string().max(60), includesAirport: z.boolean().optional() }),
  z.object({ type: z.literal("pack"), price: z.number().min(0), n: z.number().int().min(2).max(50), name: z.string().max(60) }),
  z.object({ type: z.literal("cap"), price: z.number().min(0), name: z.string().max(60) })
]);
export const CitySchema = z.object({
  id: z.string().regex(/^[a-z]{2,5}$/),
  n: z.object({ pt: z.string().min(2), en: z.string().min(2), es: z.string().min(2), fr: z.string().min(2), de: z.string().min(2) }),
  cur: z.enum(["EUR", "GBP", "TRY", "AED", "QAR", "SAR", "EGP", "JOD", "OMR", "CZK", "SGD", "USD", "CAD", "MXN", "BRL", "ARS", "MAD", "ZAR", "TZS", "TND", "ETB", "KES", "AOA", "GHS", "RWF", "XOF"]),
  single: z.number().min(0).max(MONEY), card: z.number().min(0).max(MONEY), cardName: z.string().max(40),
  alt: Alt.nullable(),
  air: Leg, ret: z.object({ core: Leg, extra: Leg }),
  stops: z.array(Stop).min(3).max(15),
  ap: z.object({ iata: z.string().regex(/^[A-Z]{3}$/), name: z.string().max(80), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  tz: z.string().max(40).optional()
}).superRefine((c, ctx) => {
  const ids = new Set<string>();
  c.stops.forEach((s, i) => { if (ids.has(s.id)) ctx.addIssue({ code: "custom", path: ["stops", i, "id"], message: "duplicate stop id" }); ids.add(s.id); });
});

type Row = typeof schema.cityContent.$inferSelect;

// Cache em memória (60 s): o conteúdo muda raramente e é lido em quase todos os pedidos.
const TTL_MS = 60_000;
let cached: { at: number; rows: Row[] } | null = null;
export function clearContentCache() { cached = null; }

async function rows(): Promise<Row[]> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.rows;
  try { const d = await db(); const r = await d.select().from(schema.cityContent); cached = { at: Date.now(), rows: r }; return r; }
  catch { return []; } // base de dados ainda sem a tabela: usa o conteúdo de origem
}

/** Conteúdo editado no painel: completa campos novos (aeroporto, fuso, dias de fecho) com os de origem. */
function withStatic(edited: City, base: City): City {
  return {
    ...edited, ap: edited.ap ?? base.ap, tz: edited.tz ?? base.tz,
    stops: edited.stops.map((s) => ({ ...s, cl: s.cl ?? base.stops.find((b) => b.id === s.id)?.cl }))
  };
}

/** Cidades ativas: conteúdo de origem com as alterações feitas no painel por cima. */
export async function loadCities(opts: { includeInactive?: boolean } = {}): Promise<(City & { edited?: boolean; active?: boolean })[]> {
  const over = new Map((await rows()).map((r) => [r.id, r]));
  const out: (City & { edited?: boolean; active?: boolean })[] = CITIES.map((c) => {
    const r = over.get(c.id);
    return r ? { ...withStatic(r.data as City, c), edited: true, active: r.active } : { ...c, active: true };
  });
  for (const r of over.values()) if (!CITIES.some((c) => c.id === r.id)) out.push({ ...(r.data as City), edited: true, active: r.active });
  return opts.includeInactive ? out : out.filter((c) => c.active !== false);
}

export async function loadCity(id: string): Promise<City | undefined> {
  return (await loadCities()).find((c) => c.id === id);
}

export async function saveCity(input: unknown, active: boolean, by: string): Promise<City> {
  const city = CitySchema.parse(input) as City;
  clearContentCache();
  const d = await db();
  await d.insert(schema.cityContent).values({ id: city.id, data: city, active, updatedBy: by, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.cityContent.id, set: { data: city, active, updatedBy: by, updatedAt: new Date() } });
  return city;
}

/** Remove as alterações e volta ao conteúdo de origem. */
export async function resetCity(id: string): Promise<void> {
  clearContentCache();
  const d = await db();
  await d.delete(schema.cityContent).where(eq(schema.cityContent.id, id));
}
