/**
 * Pedidos ao Nominatim (OpenStreetMap) em fila: no máximo 1 por segundo em todo o servidor, como pede a política de
 * uso do Nominatim. Se a fila estiver longa (> 5 s de espera), desiste em vez de sobrecarregar o serviço.
 */
let next = 0;
export async function nominatimFetch(url: string, init: RequestInit): Promise<Response> {
  const now = Date.now();
  const at = Math.max(now, next);
  if (at - now > 5000) throw new Error("nominatim_busy");
  next = at + 1100;
  if (at > now) await new Promise((r) => setTimeout(r, at - now));
  return fetch(url, init);
}
