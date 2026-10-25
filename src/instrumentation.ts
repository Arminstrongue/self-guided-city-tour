/**
 * Verificações no arranque do servidor: sem a chave de sessões (NEXTAUTH_SECRET) a app não arranca,
 * em vez de arrancar e responder com erros. O Docker reinicia-a e o Caddy mostra "Estamos a atualizar".
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    await import("./lib/env").then((m) => m.env.secret);
  } catch (e) {
    console.error(`[arranque] ${(e as Error).message}`);
    process.exit(1);
  }
}
