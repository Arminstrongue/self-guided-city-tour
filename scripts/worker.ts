/**
 * Processo automático (serviço "worker" no docker compose): todos os dias recolhe dados novos para cada cidade.
 * - de 6 em 6 horas: resumo "O que há de novo" (eventos, tempo, notícias de cultura em 12 línguas, tendências da app);
 * - uma vez por dia: renova os textos de história/resumo com mais de 7 dias e limpa histórias expiradas;
 * - de 5 em 5 minutos: circuito de monitorização (páginas, API, certificado, Instagram) com alertas por email e resumo diário.
 * Uso: npx tsx scripts/worker.ts            (fica a correr)
 *      npx tsx scripts/worker.ts --once     (uma volta e sai)
 */
import "./env";
import { loadCities } from "../src/lib/content";
import { buildPulse } from "../src/lib/city-pulse";
import { refreshAllKnowledge } from "../src/lib/city-knowledge";
import { purgeExpired } from "../src/lib/posts";
import { sweepAchievements } from "../src/lib/achievements";

const log = (m: string) => console.log(`[worker ${new Date().toISOString()}] ${m}`);
const PULSE_EVERY = 6 * 3600_000;
let lastKnowledge = 0;

async function round() {
  const cities = (await loadCities()).map((c) => c.id);
  log(`pulse: ${cities.length} cidades`);
  for (const id of cities) {
    try { await buildPulse(id, log); } catch (e) { log(`pulse ${id}: ${e}`); }
  }
  if (Date.now() - lastKnowledge > 20 * 3600_000) {
    const n = await refreshAllKnowledge(cities, fetch, log).catch((e) => { log(`wiki: ${e}`); return 0; });
    log(`história/resumos renovados: ${n}`);
    lastKnowledge = Date.now();
    const gone = await purgeExpired().catch((e) => { log(`histórias: ${e}`); return 0; });
    if (gone) log(`histórias expiradas apagadas: ${gone}`);
    const kept = await (await import("../src/lib/retention")).purgeOld().catch((e) => { log(`conservação: ${e}`); return null; });
    if (kept) log(`conservação: ${JSON.stringify(kept)}`);
  }
  // Pedidos a guias sem resposta no prazo: expiram e libertam o cartão mesmo que ninguém abra o portal.
  const exp = await (await import("../src/lib/guides")).expireStale().catch((e) => { log(`guias: ${e}`); return 0; });
  if (exp) log(`pedidos a guias expirados: ${exp}`);
  const ach = await sweepAchievements().catch((e) => { log(`conquistas: ${e}`); return null; });
  if (ach) log(`conquistas: ${ach.users} viajantes, ${ach.announced} avisos`);
  log("volta concluída");
}

/** Uma volta de cada vez: se a anterior ainda estiver a correr (muitas cidades, APIs lentas), esta salta. */
let running = false;
async function safeRound() {
  if (running) { log("volta anterior ainda a correr — salta"); return; }
  running = true;
  try { await round(); } catch (e) { log(`erro: ${e}`); } finally { running = false; }
}

async function main() {
  const once = process.argv.includes("--once");
  await safeRound();
  if (once) process.exit(0);
  setInterval(() => { void safeRound(); }, PULSE_EVERY);
  // Pedidos a guias têm prazos curtos: verificar de 15 em 15 minutos (leve).
  setInterval(() => { void import("../src/lib/guides").then((g) => g.expireStale()).catch((e) => log(`guias: ${e}`)); }, 15 * 60_000);
  // Monitorização: primeira volta 2 min depois de arrancar (a app pode ainda estar a subir no deploy).
  setTimeout(() => { void monitor(); setInterval(() => { void monitor(); }, 5 * 60_000); }, 2 * 60_000);
}

let monitoring = false;
async function monitor() {
  if (monitoring || process.env.MONITOR === "0") return;
  monitoring = true;
  try {
    const m = await import("../src/lib/monitor");
    const ig = await import("../src/lib/instagram");
    const { staleData } = await import("../src/lib/data-freshness");
    await m.monitorRound(log, [ig.instagramCheck]);
    await m.dailySummary(log, staleData, () => ig.instagramSummary());
    if (new Date().getUTCMinutes() < 5) await m.pruneMonitor();
  } catch (e) { log(`monitor: ${e}`); } finally { monitoring = false; }
}
void main();
