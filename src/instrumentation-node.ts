/** Só no servidor Node: sem chave de sessões válida, a app sai em vez de arrancar com erros. */
import { env } from "./lib/env";

export function checkStartup() {
  try { void env.secret; } catch (e) {
    console.error(`[arranque] ${(e as Error).message}`);
    process.exit(1);
  }
}
