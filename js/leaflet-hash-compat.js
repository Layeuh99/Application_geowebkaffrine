/**
 * Leaflet Hash - Bibliothèque de compatibilité
 * Ce fichier fournit une implémentation de base pour éviter les erreurs
 * quand la bibliothèque L.Hash n'est pas disponible
 */

// Vérifier si L.Hash existe déjà
if (typeof L !== 'undefined' && !L.Hash) {
    // Créer une classe L.Hash fictive pour éviter les erreurs
    L.Hash = function(map) {
        console.warn('[HASH] Leaflet Hash n\'est pas disponible. Fonctionnalités de permaliens désactivées.');
        return {
            addTo: function() {
                console.warn('[HASH] Ajout du hash impossible');
            }
        };
    };
    
    console.log('[HASH] Mode de compatibilité activé - fonctionnalités de permaliens désactivées');
}
