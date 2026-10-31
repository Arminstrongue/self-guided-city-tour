"use client";
/**
 * Reservas e bilhetes: com sessão ficam na conta (e uma cópia neste telemóvel para funcionar sem internet);
 * sem sessão ficam só neste telemóvel.
 */
import type { Reservation, ResInput } from "./reservations";
export type { Reservation, ResInput };
const KEY = "sgct:res";

export function cachedReservations(): Reservation[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") ?? []; } catch { return []; }
}
function cache(list: Reservation[]) {
  // Com muitas fotos o telemóvel pode não ter espaço: guarda então só a primeira foto de cada reserva, e por fim sem fotos.
  const tries = [list, list.map((r) => ({ ...r, photos: (r.photos ?? []).slice(0, 1) })), list.map((r) => ({ ...r, photo: "", photos: [] }))];
  for (const l of tries) { try { localStorage.setItem(KEY, JSON.stringify(l)); break; } catch { /* cheio: tenta mais leve */ } }
  window.dispatchEvent(new Event("sgct:res"));
}

/** Lista atual: da conta se houver sessão e internet; senão a cópia local. */
export async function loadReservations(signed: boolean): Promise<Reservation[]> {
  if (!signed || !navigator.onLine) return cachedReservations();
  const r = await fetch("/api/me/reservations", { cache: "no-store" }).catch(() => null);
  if (!r?.ok) return cachedReservations();
  const server = ((await r.json()) as { list: Reservation[] }).list;
  // Reservas criadas sem sessão neste telemóvel passam para a conta.
  const localOnly = cachedReservations().filter((x) => x.id.startsWith("local-"));
  for (const x of localOnly) { const { id: _id, startsAt: _s, ...rest } = x; const s = await saveRemote(rest); if (s) server.push(s); }
  server.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  cache(server);
  return server;
}

async function saveRemote(v: ResInput, id?: string): Promise<Reservation | null> {
  const r = await fetch("/api/me/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, ...(id && !id.startsWith("local-") ? { id } : {}) }) }).catch(() => null);
  return r?.ok ? ((await r.json()) as { reservation: Reservation }).reservation : null;
}

export async function saveReservation(signed: boolean, v: ResInput, startsAt: string, id?: string): Promise<Reservation | null> {
  let saved: Reservation | null = null;
  if (signed) saved = await saveRemote(v, id);
  if (!saved && signed) return null;
  saved ??= { ...v, id: id ?? `local-${Date.now().toString(36)}`, startsAt };
  const list = cachedReservations().filter((x) => x.id !== id && x.id !== saved!.id);
  list.push(saved); list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  cache(list);
  return saved;
}

export async function removeReservation(signed: boolean, id: string) {
  if (signed && !id.startsWith("local-")) await fetch(`/api/me/reservations?id=${id}`, { method: "DELETE" }).catch(() => null);
  cache(cachedReservations().filter((x) => x.id !== id));
}

/** Foto do bilhete reduzida (lado maior 1400 px, JPEG) para caber na conta e no telemóvel. */
export async function compressPhoto(file: File, maxLen = 550_000): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const k = Math.min(1, 1400 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    let q = 0.8, out = c.toDataURL("image/jpeg", q);
    while (out.length > maxLen && q > 0.35) { q -= 0.1; out = c.toDataURL("image/jpeg", q); }
    return out;
  } finally { URL.revokeObjectURL(url); }
}
