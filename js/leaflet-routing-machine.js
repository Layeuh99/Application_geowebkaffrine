/**
 * Leaflet Routing Machine - Bibliothèque de compatibilité
 * Ce fichier fournit une implémentation de base pour éviter les erreurs
 * quand la bibliothèque Leaflet Routing Machine n'est pas disponible
 */

// Vérifier si L.Routing existe déjà
if (typeof L !== 'undefined' && !L.Routing) {
    // Créer un objet L.Routing fictif pour éviter les erreurs
    L.Routing = {
        control: function(options) {
            console.warn('[ROUTING] Leaflet Routing Machine n\'est pas disponible. Mode dégradé activé.');
            return {
                addTo: function() {
                    console.warn('[ROUTING] Ajout du contrôle de routage impossible');
                },
                setWaypoints: function() {
                    console.warn('[ROUTING] Configuration des waypoints impossible');
                },
                on: function() {
                    console.warn('[ROUTING] Écouteur d\'événements impossible');
                }
            };
        },
        osrmv1: function(options) {
            console.warn('[ROUTING] OSRM v1 non disponible');
            return {
                route: function() {
                    return Promise.resolve([]);
                }
            };
        }
    };
    
    console.log('[ROUTING] Mode de compatibilité activé - fonctionnalités limitées');
}
