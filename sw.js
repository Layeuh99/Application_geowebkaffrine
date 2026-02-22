const APP_CACHE = "geoweb-v25-static";
const TILE_CACHE = "geoweb-v25-tiles";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./css/base.css",
  "./css/layout.css",
  "./css/navbar.css",
  "./css/mobile.css",
  "./css/theme.css",
  "./css/leaflet.css",
  "./css/leaflet-measure.css",
  "./js/app.js",
  "./js/map.js",
  "./js/ui.js",
  "./js/theme.js",
  "./js/leaflet.js",
  "./js/leaflet-measure.js",
  "./data/Region_3.js",
  "./data/Departement_4.js",
  "./data/Arrondissement_5.js",
  "./data/Routes_6.js",
  "./data/Localites_7.js",
  "./data/Ecoles_8.js",
  "./install.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== APP_CACHE && key !== TILE_CACHE).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isTile =
    url.hostname.includes("tile.openstreetmap.org") ||
    url.pathname.includes("toner-lite") ||
    url.hostname.includes("cartocdn.com") ||
    url.hostname.includes("arcgisonline.com");

  if (isTile) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const network = fetch(req).then((res) => {
            cache.put(req, res.clone());
            return res;
          }).catch(() => hit);
          return hit || network;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(APP_CACHE).then((cache) => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});






















