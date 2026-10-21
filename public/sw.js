/* Self Guided City Tour — service worker: roteiros, mapas e ferramentas disponíveis sem internet. */
const VERSION = "sgct-v4";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = "sgct-offline";   // cidades descarregadas pelo viajante (sobrevive a novas versões)
const TILES = "sgct-tiles";       // mosaicos do mapa já vistos
const MAX_TILES = 1500;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!k.startsWith(VERSION) && k !== OFFLINE && k !== TILES) await caches.delete(k);
    await self.clients.claim();
  })());
});

/** Rede primeiro; sem rede, a cópia guardada (descarregada ou de uma visita anterior). */
async function networkFirst(req, cacheName) {
  try {
    const r = await fetch(req);
    if (r.ok) {
      const c = await caches.open(cacheName);
      await c.put(req, r.clone());
      // Se a cidade foi descarregada, mantém a cópia offline atualizada.
      const off = await caches.open(OFFLINE);
      if (await off.match(req)) await off.put(req, r.clone());
    }
    return r;
  } catch {
    return (await caches.match(req, { ignoreVary: true })) || Response.error();
  }
}

/** APIs de leitura que fazem sentido sem rede (o resto continua a ir sempre à rede). */
const OFFLINE_API = /^\/api\/(weather|explore|eat|media|fx|events|me\/split|me\/plans)(\/|$|\?)/;

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Mosaicos do mapa (OpenStreetMap ou o fornecedor configurado): rede primeiro e guardar os vistos; sem rede, os guardados ou descarregados.
  if (url.origin !== self.location.origin && (/(^|\.)tile\.openstreetmap\.org$|basemaps\.cartocdn\.com$/.test(url.hostname) || /\/\d{1,2}\/\d+\/\d+(@2x)?\.(png|jpe?g|webp)$/.test(url.pathname))) {
    e.respondWith((async () => {
      const c = await caches.open(TILES);
      try {
        const r = await fetch(req);
        if (r.ok || r.type === "opaque") { await c.put(req, r.clone()); trimTiles(c); }
        return r;
      } catch { return (await c.match(req)) || (await caches.match(req)) || Response.error(); }
    })());
    return;
  }
  // Fotografias descarregadas (Wikimedia): a cópia guardada, senão a rede.
  if (url.hostname === "upload.wikimedia.org") {
    e.respondWith(caches.open(OFFLINE).then(async (c) => (await c.match(req, { ignoreVary: true })) || fetch(req)));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    if (OFFLINE_API.test(url.pathname + url.search)) e.respondWith(networkFirst(req, PAGES));
    return;
  }
  // Ficheiros com hash (JS, CSS, fontes): primeiro a cache.
  if (url.pathname.startsWith("/_next/static/") || /\.(woff2?|png|svg|webmanifest)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(async (r) => { if (r.ok) (await caches.open(STATIC)).put(req, r.clone()); return r; })));
    return;
  }
  // Páginas: roteiro, plano, carteira e cidade — rede primeiro, cópia sem rede.
  if (req.mode === "navigate" && /^\/[a-z]{2}\/(tour|plan|wallet|c)(\/|$)/.test(url.pathname)) e.respondWith(networkFirst(req, PAGES));
});

let trimming = false;
async function trimTiles(c) {
  if (trimming) return; trimming = true;
  try { const keys = await c.keys(); for (const k of keys.slice(0, Math.max(0, keys.length - MAX_TILES))) await c.delete(k); } finally { trimming = false; }
}

/* ---------- Descarregar uma cidade para usar sem internet ---------- */
self.addEventListener("message", (e) => {
  const d = e.data || {};
  const port = e.ports && e.ports[0];
  if (d.type === "offline-save" && Array.isArray(d.urls)) {
    e.waitUntil((async () => {
      const c = await caches.open(OFFLINE);
      const st = await caches.open(STATIC);
      let done = 0, failed = 0, bytes = 0;
      const urls = [...new Set(d.urls)].slice(0, 1400);
      const one = async (u) => {
        try {
          const same = new URL(u, self.location.origin).origin === self.location.origin;
          const r = await fetch(u, same ? { credentials: "same-origin" } : { mode: "no-cors" });
          if (!(r.ok || r.type === "opaque")) throw new Error(String(r.status));
          if (same && (r.headers.get("content-type") || "").includes("text/html")) {
            // A página precisa dos seus scripts e estilos: guarda-os também.
            const html = await r.clone().text();
            const assets = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
            await Promise.all([...new Set(assets)].map(async (a) => { if (!(await st.match(a))) { const x = await fetch(a).catch(() => null); if (x && x.ok) await st.put(a, x); } }));
          }
          bytes += Number(r.headers.get("content-length") || 0);
          await c.put(u, r);
        } catch { failed++; }
        done++;
        if (port) port.postMessage({ done, total: urls.length });
      };
      for (let i = 0; i < urls.length; i += 6) await Promise.all(urls.slice(i, i + 6).map(one));
      if (port) port.postMessage({ finished: true, done, failed, total: urls.length, bytes });
    })());
  }
  if (d.type === "offline-remove" && Array.isArray(d.urls)) {
    e.waitUntil((async () => {
      const c = await caches.open(OFFLINE);
      for (const u of d.urls) await c.delete(u);
      if (port) port.postMessage({ finished: true });
    })());
  }
});

/* ---------- Notificações push (gostos, comentários, seguidores, mensagens) ---------- */
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Self Guided City Tour", {
    body: d.body || "", icon: "/icon-192.png", badge: "/icon-192.png", tag: d.tag || undefined, renotify: Boolean(d.tag), data: { url: d.url || "/" }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (new URL(c.url).origin === self.location.origin && "focus" in c) { await c.focus(); if ("navigate" in c) await c.navigate(url).catch(() => null); return; }
    }
    await self.clients.openWindow(url);
  })());
});
