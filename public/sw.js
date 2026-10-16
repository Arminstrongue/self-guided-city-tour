/* Self Guided City Tour — service worker: roteiro disponível sem internet. */
const VERSION = "sgct-v1";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!k.startsWith(VERSION)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Ficheiros com hash (JS, CSS, fontes): primeiro a cache.
  if (url.pathname.startsWith("/_next/static/") || /\.(woff2?|png|svg|webmanifest)$/.test(url.pathname)) {
    e.respondWith(caches.open(STATIC).then(async (c) => (await c.match(req)) || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  // Páginas do roteiro: primeiro a rede, guardar cópia; sem rede, mostrar a cópia.
  if (req.mode === "navigate" && /^\/[a-z]{2}\/tour\//.test(url.pathname)) {
    e.respondWith(caches.open(PAGES).then(async (c) => {
      try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }
      catch { return (await c.match(req)) || Response.error(); }
    }));
  }
});
