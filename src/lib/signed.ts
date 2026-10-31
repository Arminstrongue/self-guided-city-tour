/**
 * Há sessão? Pergunta uma vez por página a /api/me/status (responde sempre 200), para não pedir
 * /api/me/* sem sessão e encher a consola de erros 401 para quem só está a ver.
 * null = não foi possível saber (sem ligação): quem chama decide (normalmente tenta na mesma).
 */
let p: Promise<boolean | null> | null = null;
export function signedStatus(fresh = false): Promise<boolean | null> {
  if (fresh || !p) {
    p = fetch("/api/me/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { signed?: boolean } | null) => (j ? Boolean(j.signed) : null))
      .catch(() => null);
    void p.then((v) => { if (v === null) p = null; }); // sem resposta: volta a perguntar da próxima vez
  }
  return p;
}
