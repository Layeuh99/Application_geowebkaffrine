// ============================================
// SERVICE WORKER DÉSACTIVÉ - GéoWeb Kaffrine
// ============================================
// Ce fichier remplace sw.js pour désactiver complètement le Service Worker

console.log('[SW] Service Worker désactivé pour stabilisation de l\'application');

// Désactiver tous les événements
self.addEventListener('install', (event) => {
    console.log('[SW] Install event ignoré - Service Worker désactivé');
    event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event ignoré - Service Worker désactivé');
    event.waitUntil(Promise.resolve());
});

self.addEventListener('fetch', (event) => {
    console.log('[SW] Fetch event ignoré - Service Worker désactivé');
    // Laisser passer les requêtes sans intervention
    event.respondWith(fetch(event.request));
});

self.addEventListener('message', (event) => {
    console.log('[SW] Message event ignoré - Service Worker désactivé');
});

// Nettoyer tous les caches existants
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('[SW] Suppression du cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
