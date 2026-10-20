"use client";
/** Wishlist (❤️): lugares e momentos que o viajante quer visitar. Fica no dispositivo e, com sessão, na conta (prefs.saved). */
export type Wish = { city: string; cityName?: string; title: string; lat: number; lng: number; icon?: string; at: number };
const KEY = "sgct:wish";
export const wishKey = (w: { city: string; title: string }) => `${w.city}|${w.title.toLowerCase()}`;

function readLocal(): Wish[] { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; } }
function writeLocal(l: Wish[]) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* ignorar */ } }
function merge(a: Wish[], b: Wish[]) { const m = new Map<string, Wish>(); for (const w of [...a, ...b]) if (!m.has(wishKey(w))) m.set(wishKey(w), w); return [...m.values()].slice(0, 300); }

let signed: boolean | null = null;
/** Junta a lista do dispositivo com a da conta (e envia para a conta o que só estava no dispositivo). */
export async function loadWish(): Promise<{ list: Wish[]; signed: boolean }> {
  const local = readLocal();
  const r = await fetch("/api/me/prefs", { cache: "no-store" }).catch(() => null);
  if (!r?.ok) { signed = false; return { list: local, signed: false }; }
  signed = true;
  const account = ((await r.json()) as { saved?: Wish[] }).saved ?? [];
  const list = merge(account, local);
  if (list.length !== account.length) void push(list);
  writeLocal(list);
  return { list, signed: true };
}
async function push(list: Wish[]) {
  if (signed === false) return;
  await fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ saved: list }) }).catch(() => null);
}
export async function saveWish(list: Wish[]) { writeLocal(list); await push(list); }
export function toggleWish(list: Wish[], w: Omit<Wish, "at">): Wish[] {
  const k = wishKey(w);
  return list.some((x) => wishKey(x) === k) ? list.filter((x) => wishKey(x) !== k) : [{ ...w, at: Date.now() }, ...list].slice(0, 300);
}
