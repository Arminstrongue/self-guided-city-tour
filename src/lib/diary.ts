/** Diário de viagem: memórias guardadas só no dispositivo (IndexedDB). Sem conta e sem servidor. */
export type Memory = { id: string; city: string; cityName: string; title: string; note: string; photo: string | null; lat: number | null; lng: number | null; at: number };

const DB = "sgct-diary", STORE = "memories";
function open(): Promise<IDBDatabase> {
  return new Promise((ok, bad) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: "id" }); };
    r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error);
  });
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((ok, bad) => { const q = fn(db.transaction(STORE, mode).objectStore(STORE)); q.onsuccess = () => ok(q.result); q.onerror = () => bad(q.error); });
}
export async function saveMemory(m: Omit<Memory, "id" | "at">): Promise<Memory> {
  const full: Memory = { ...m, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, at: Date.now() };
  await tx("readwrite", (s) => s.put(full));
  try { window.dispatchEvent(new Event("sgct:diary")); } catch { /* ignorar */ }
  return full;
}
export async function listMemories(): Promise<Memory[]> {
  try { return ((await tx("readonly", (s) => s.getAll())) as Memory[]).sort((a, b) => b.at - a.at); } catch { return []; }
}
export async function deleteMemory(id: string) { await tx("readwrite", (s) => s.delete(id)); }
