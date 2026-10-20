/**
 * Teto diário de pedidos pagos ao Google, controlado pela própria app (o Google não deixa ajustar a quota diária).
 * GOOGLE_MAX_SEARCH_PER_DAY (pesquisas) e GOOGLE_MAX_PHOTOS_PER_DAY (fotos). Ao chegar ao teto, a app usa
 * a reserva (OpenStreetMap / Wikimedia) até ao dia seguinte (UTC).
 */
type Kind = "search" | "photo";
const LIMIT: Record<Kind, () => number> = {
  search: () => Number(process.env.GOOGLE_MAX_SEARCH_PER_DAY ?? 300),
  photo: () => Number(process.env.GOOGLE_MAX_PHOTOS_PER_DAY ?? 500)
};
let day = "";
const used: Record<Kind, number> = { search: 0, photo: 0 };

/** Reserva um pedido; devolve false se o teto do dia já foi atingido. */
export function takeGoogle(kind: Kind): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) { day = today; used.search = 0; used.photo = 0; }
  if (used[kind] >= LIMIT[kind]()) {
    if (used[kind] === LIMIT[kind]()) { console.warn(`[google] teto diário de ${kind} atingido (${used[kind]})`); used[kind]++; }
    return false;
  }
  used[kind]++;
  return true;
}
export const googleUsage = () => ({ day, ...used });
