/**
 * Conta oficial @voybu: dá conteúdo à app desde o primeiro dia (capa de cada cidade + dicas
 * dos "momentos"), aparece no feed de toda a gente e é sugerida a quem chega. Criada sozinha, uma vez.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { MOMENTS } from "@/data/moments";
import { CITIES } from "@/data/cities";

export const OFFICIAL_EMAIL = "official@selfguidedcitytour.com" // chave interna na base de dados (não é enviado email para aqui): não mudar;
export const OFFICIAL_HANDLE = "voybu";

declare global { var __sgctOfficial: Promise<void> | undefined } // eslint-disable-line no-var

/** Garante o perfil oficial e as publicações iniciais (só corre uma vez por processo; idempotente). */
export function ensureOfficial() {
  if (process.env.SGCT_NO_OFFICIAL === "1") return Promise.resolve(); // testes que não a querem
  globalThis.__sgctOfficial ??= seed().catch((e) => { console.error("[oficial]", String(e).slice(0, 200)); globalThis.__sgctOfficial = undefined; });
  return globalThis.__sgctOfficial;
}

async function icon() {
  try { return `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", "icon-192.png"))).toString("base64")}`; } catch { return null; }
}

async function seed() {
  const d = await db();
  const [p] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, OFFICIAL_EMAIL)).limit(1);
  if (p && p.handle !== OFFICIAL_HANDLE) {
    // Mudança de marca (Self Guided City Tour → VOYBU): renomeia a conta oficial existente.
    await d.update(schema.travellerProfiles).set({ handle: OFFICIAL_HANDLE, name: "VOYBU" }).where(eq(schema.travellerProfiles.email, OFFICIAL_EMAIL));
  }
  if (!p) {
    await d.insert(schema.travellerProfiles).values({
      email: OFFICIAL_EMAIL, handle: OFFICIAL_HANDLE, name: "VOYBU", isPrivate: false, photo: await icon(),
      bio: "✓ Official · City tips, sunsets and hidden spots for travellers on a layover. 🌍"
    }).onConflictDoNothing();
  }
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.posts).where(eq(schema.posts.author, OFFICIAL_EMAIL));
  if (n > 0) return;
  const { cityCover } = await import("./media");
  // Intercalado por cidade (capas primeiro, depois as dicas), espaçado de 3 em 3 horas para trás: o feed fica variado.
  const queue: { city: string; text: string; photo: string | null; tag: string | null }[][] = [[], [], []];
  for (const c of CITIES) {
    const ms = MOMENTS[c.id] ?? [];
    const name = c.n.en ?? Object.values(c.n)[0];
    const cover = await cityCover(c.id, name).then((x) => x[0]).catch(() => undefined);
    const top = ms[0];
    const credit = cover ? `\n📷 ${cover.credit.replace(/<[^>]+>/g, "").slice(0, 60)} · Wikimedia Commons (${cover.license})` : "";
    queue[0].push({ city: c.id, text: `📍 ${name}${top ? ` — ${top.en[0]}. ${top.en[1]}` : ""}${credit}`, photo: cover?.thumb ?? cover?.url ?? null, tag: top?.h[0] ?? "photo" });
    ms.slice(1, 3).forEach((m, k) => queue[k + 1].push({ city: c.id, text: `${m.icon} ${m.en[0]} · ${name}\n${m.en[1]}`, photo: null, tag: m.h[0] ?? null }));
  }
  const now = Date.now();
  let i = 0;
  for (const p of queue.flat()) {
    await d.insert(schema.posts).values({ author: OFFICIAL_EMAIL, kind: "post", text: p.text.slice(0, 500), photo: p.photo, city: p.city, tag: p.tag, createdAt: new Date(now - (30 + i++ * 180) * 60_000) });
  }
}

/** Quem cria perfil passa a seguir a conta oficial (para nunca ver o feed vazio). */
export async function followOfficial(email: string) {
  if (email === OFFICIAL_EMAIL || process.env.SGCT_NO_OFFICIAL === "1") return;
  const d = await db();
  await ensureOfficial();
  await d.insert(schema.follows).values({ follower: email, followee: OFFICIAL_EMAIL, status: "accepted" }).onConflictDoNothing();
}

export const isOfficial = (handle: string) => handle === OFFICIAL_HANDLE;
