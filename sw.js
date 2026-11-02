// Service worker: tiene l'app in memoria, così funziona anche senza rete.
// L'elenco dei file e la versione si aggiornano con:  node tools/aggiorna-sw.js
const VERSION = "vbb5a5a2a";
const CACHE = "home-apps-" + VERSION;
const ARCHIVIO = [
// <ARCHIVIO>
  "./",
  "apps/orologio/",
  "apps/stratagemmi/",
  "apps/orologio/app.js",
  "apps/orologio/icon.png",
  "apps/orologio/index.html",
  "apps/orologio/style.css",
  "apps/stratagemmi/app.js",
  "apps/stratagemmi/icon.png",
  "apps/stratagemmi/index.html",
  "apps/stratagemmi/stratagems.js",
  "apps/stratagemmi/style.css",
  "css/style.css",
  "index.html",
  "js/apps.js",
  "js/main.js",
  "manifest.webmanifest",
  "pwa/apple-touch-icon.png",
  "pwa/icon-192.png",
  "pwa/icon-512.png",
// </ARCHIVIO>
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // un file mancante (es. un suono non ancora caricato) non blocca l'installazione
    await Promise.allSettled(ARCHIVIO.map((u) => c.add(new Request(u, { cache: "reload" }))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("home-apps-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(gestisci(r));
});

async function gestisci(r) {
  const c = await caches.open(CACHE);
  const range = r.headers.get("range");
  let res = await c.match(r.url, { ignoreSearch: true });
  if (!res) {
    try {
      res = await fetch(range ? r.url : r);
      if (res.status === 200) c.put(r.url, res.clone());
    } catch (err) {
      return (await c.match(new URL("./", self.registration.scope).href)) || Response.error();
    }
  }
  return range && res.status === 200 ? fetta(res, range) : res;
}

// Safari chiede l'audio a pezzi (Range): rispondiamo con la parte richiesta
async function fetta(res, range) {
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d+)-(\d*)/.exec(range);
  const start = +m[1];
  const end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`,
      "Content-Length": String(end - start + 1),
    },
  });
}
