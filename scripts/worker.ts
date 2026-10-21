/**
 * Processo automático (serviço "worker" no docker compose): todos os dias recolhe dados novos para cada cidade.
 * - de 6 em 6 horas: resumo "O que há de novo" (eventos, tempo, notícias de cultura em 12 línguas, tendências da app);
 * - uma vez por dia: renova os textos de história/resumo com mais de 7 dias e limpa histórias expiradas.
 * Uso: npx tsx scripts/worker.ts            (fica a correr)
 *      npx tsx scripts/worker.ts --once     (uma volta e sai)
 */
import "./env";
import { loadCities } from "../src/lib/content";
import { buildPulse } from "../src/lib/city-pulse";
import { refreshAllKnowledge } from "../src/lib/city-knowledge";
import { purgeExpired } from "../src/lib/posts";

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
    const gone = await purgeExpired().catch(() => 0);
    if (gone) log(`histórias expiradas apagadas: ${gone}`);
  }
  log("volta concluída");
}

async function main() {
  const once = process.argv.includes("--once");
  await round();
  if (once) process.exit(0);
  setInterval(() => { void round().catch((e) => log(`erro: ${e}`)); }, PULSE_EVERY);
}
void main();
