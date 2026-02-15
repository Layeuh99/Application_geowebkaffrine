// ============================================
// SERVICE WORKER COMPLÈTEMENT DÉSACTIVÉ
// ============================================

console.log('[SW] Service Worker désactivé - plus d\'interception des requêtes');

// Ne plus intercepter les requêtes - laisser passer directement
self.addEventListener('fetch', (event) => {
    // Ne rien faire - laisser le navigateur gérer normalement
    return;
});

// Désactiver tous les autres événements
self.addEventListener('install', (event) => {
    console.log('[SW] Install désactivé');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate désactivé');
    event.waitUntil(self.clients.claim());
});

// Nettoyer tous les caches
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
