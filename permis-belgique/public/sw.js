/* Service worker : met l'application en cache pour qu'elle fonctionne hors connexion.
   VERSION et PRECACHE sont générés par `npm run build` (scripts/stamp-sw.mjs) : ne pas les modifier à la main. */
const VERSION = "73faf3804a6a";
const PRECACHE = [
  "/",
  "/css/app.css",
  "/favicon.svg",
  "/fonts/atkinson-hyperlegible-latin-400-normal.woff2",
  "/fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "/fonts/barlow-condensed-latin-500-normal.woff2",
  "/fonts/barlow-condensed-latin-600-normal.woff2",
  "/fonts/barlow-condensed-latin-700-normal.woff2",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/js/app.js",
  "/js/illustrations.js",
  "/js/pwa.js",
  "/js/questions.js",
  "/manifest.webmanifest"
];
const CACHE = "permis-b-" + VERSION;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("permis-b-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages : toujours la page d'accueil de la version en cache (l'application tient sur une seule page)
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cached = await caches.match("/", { cacheName: CACHE });
      if (cached) return cached;
      try { return await fetch(req); } catch (e) { return Response.error(); }
    })());
    return;
  }

  // Fichiers de l'application : cache d'abord (version cohérente), réseau sinon
  event.respondWith((async () => {
    const cached = await caches.match(req, { cacheName: CACHE, ignoreSearch: true });
    if (cached) return cached;
    try {
      return await fetch(req);
    } catch (e) {
      return Response.error();
    }
  })());
});
