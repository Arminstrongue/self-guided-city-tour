/**
 * Conquistas: quando um viajante sobe de nível, ganha uma medalha ou desbloqueia um prémio, recebe UMA notificação
 * (centro de notificações + push), assinada pela conta oficial.
 * Contas que já existiam antes desta funcionalidade ("legacy") registam o estado atual em silêncio na 1.ª verificação,
 * para não receberem dezenas de avisos de uma vez.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { myScore, REWARDS } from "./points";
import { notify } from "./notify";
import { ensureOfficial, OFFICIAL_EMAIL } from "./official";

export function achievementKeys(s: { level: number; badges: string[]; rewardPoints: number }) {
  return [
    ...(s.level > 0 ? [`level:${s.level}`] : []),
    ...s.badges.map((b) => `badge:${b}`),
    ...REWARDS.filter((r) => s.rewardPoints >= r.at).map((r) => `reward:${r.at}`)
  ];
}

/** Verifica e anuncia conquistas novas. Devolve as chaves anunciadas. Seguro de chamar muitas vezes. */
export async function checkAchievements(email: string): Promise<string[]> {
  if (!email || email === OFFICIAL_EMAIL) return [];
  const d = await db();
  const s = await myScore(email);
  const keys = achievementKeys(s);
  const have = new Set((await d.select({ k: schema.achievements.key }).from(schema.achievements).where(eq(schema.achievements.email, email))).map((r) => r.k));
  const silent = have.has("legacy") && !have.has("init");
  const fresh = keys.filter((k) => !have.has(k));
  if (!have.has("init")) fresh.push("init");
  if (!fresh.length) return [];
  const ins = await d.insert(schema.achievements).values(fresh.map((key) => ({ email, key }))).onConflictDoNothing().returning({ k: schema.achievements.key });
  const won = ins.map((r) => r.k).filter((k) => k !== "init");
  if (silent || !won.length) return [];
  await ensureOfficial();
  // Só o nível mais alto (se subiu dois de uma vez) e no máximo 3 avisos por verificação.
  const lv = won.filter((k) => k.startsWith("level:")).sort((a, b) => Number(b.split(":")[1]) - Number(a.split(":")[1])).slice(0, 1);
  const out = [...lv, ...won.filter((k) => !k.startsWith("level:"))].slice(0, 3);
  // Código de texto: os prémios levam o valor (cêntimos) para o browser não precisar de saber a tabela.
  const codes = out.map((key) => { const r = REWARDS.find((x) => `reward:${x.at}` === key); return r ? `${key}:${r.cents}` : key; });
  for (const text of codes) await notify(email, OFFICIAL_EMAIL, "achievement", { text });
  return codes;
}

/** Para o worker: verifica todos os viajantes com atividade (convites pagos, check-ins de amigos, etc. chegam aqui). */
export async function sweepAchievements() {
  const d = await db();
  const rows = await d.selectDistinct({ e: schema.accesses.email }).from(schema.accesses);
  const prof = await d.select({ e: schema.travellerProfiles.email }).from(schema.travellerProfiles);
  const all = [...new Set([...rows, ...prof].map((r) => r.e))].filter((e) => e !== OFFICIAL_EMAIL);
  let n = 0;
  for (const e of all) n += (await checkAchievements(e).catch(() => [])).length;
  return { users: all.length, announced: n };
}

/** Apagar conta. */
export async function purgeAchievements(email: string) {
  const d = await db();
  await d.delete(schema.achievements).where(eq(schema.achievements.email, email));
}
