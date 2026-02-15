/**
 * Module d'Analyse de Réseau (Itinéraire) - GéoWeb Kaffrine
 * Calcul d'itinéraires avec Leaflet Routing Machine
 */

// ============================================
// VARIABLES GLOBALES
// ============================================
let routingControl = null;
let startMarker = null;
let endMarker = null;
let isRoutingMode = false;
let routingStep = 'start'; // 'start', 'end', 'complete'

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le module de routage
 */
function initRoutingModule() {
    // Vérifier si Leaflet Routing Machine est disponible
    if (typeof L.Routing === 'undefined') {
        console.warn('Leaflet Routing Machine non disponible');
        return;
    }
    
    // Créer le contrôle de routage avec configuration OSRM
    routingControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null,
        lineOptions: {
            styles: [
                {color: '#667eea', weight: 6, opacity: 0.8},
                {color: 'white', weight: 4, opacity: 0.6},
                {color: '#667eea', weight: 2, opacity: 1}
            ]
        },
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
        }),
        formatter: new L.Routing.Formatter({
            language: 'fr',
            units: 'metric'
        })
    });
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Active le mode de calcul d'itinéraire
 */
function enableRoutingMode() {
    if (isRoutingMode) {
        disableRoutingMode();
        return;
    }
    
    isRoutingMode = true;
    routingStep = 'start';
    
    map.getContainer().style.cursor = 'crosshair';
    
    showNotification('Cliquez pour définir le point de départ', 'info');
    
    // Ajouter l'écouteur de clic
    map.on('click', handleRoutingClick);
    
    // Afficher le panneau de contrôle du routage
    showRoutingPanel();
}

/**
 * Gère les clics sur la carte pour le routage
 * @param {Object} e - Événement de clic
 */
function handleRoutingClick(e) {
    if (!isRoutingMode) return;
    
    const point = e.latlng;
    
    if (routingStep === 'start') {
        setStartPoint(point);
    } else if (routingStep === 'end') {
        setEndPoint(point);
    }
}

/**
 * Définit le point de départ
 * @param {L.LatLng} point - Coordonnées du point de départ
 */
function setStartPoint(point) {
    // Supprimer le marqueur précédent
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    
    // Créer le marqueur de départ
    startMarker = L.marker(point, {
        icon: L.divIcon({
            className: 'routing-marker routing-start',
            html: '<i class="fas fa-play"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    startMarker.bindPopup('<strong>Départ</strong>').openPopup();
    
    routingStep = 'end';
    showNotification('Cliquez pour définir le point d\'arrivée', 'info');
    
    updateRoutingPanel();
}

/**
 * Définit le point d'arrivée
 * @param {L.LatLng} point - Coordonnées du point d'arrivée
 */
function setEndPoint(point) {
    // Supprimer le marqueur précédent
    if (endMarker) {
        map.removeLayer(endMarker);
    }
    
    // Créer le marqueur d'arrivée
    endMarker = L.marker(point, {
        icon: L.divIcon({
            className: 'routing-marker routing-end',
            html: '<i class="fas fa-flag-checkered"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    endMarker.bindPopup('<strong>Arrivée</strong>').openPopup();
    
    routingStep = 'complete';
    calculateRoute();
    updateRoutingPanel();
}

/**
 * Calcule l'itinéraire entre les points
 */
function calculateRoute() {
    if (!startMarker || !endMarker || !routingControl) {
        showNotification('Veuillez définir les points', 'warning');
        return;
    }
    
    const waypoints = [
        startMarker.getLatLng(),
        endMarker.getLatLng()
    ];
    
    // Mettre à jour les waypoints du contrôle
    routingControl.setWaypoints(waypoints);
    
    // Ajouter le contrôle à la carte
    routingControl.addTo(map);
    
    // Écouter les événements de routage
    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        // Afficher les informations sur l'itinéraire
        displayRouteInfo(summary);
        
        showNotification('Itinéraire calculé', 'success');
    });
    
    routingControl.on('routingerror', function(e) {
        showNotification('Erreur de calcul: ' + e.error.message, 'error');
    });
}

/**
 * Affiche les informations sur l'itinéraire
 * @param {Object} summary - Résumé de l'itinéraire
 */
function displayRouteInfo(summary) {
    const distance = (summary.totalDistance / 1000).toFixed(2);
    const time = Math.round(summary.totalTime / 60);
    
    const infoHtml = `
        <div style="background: #f0f4ff; padding: 15px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #667eea;">
                <i class="fas fa-route"></i> Itinéraire
            </h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>Distance:</strong>
                <span>${distance} km</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <strong>Temps estimé:</strong>
                <span>${time} minutes</span>
            </div>
        </div>
    `;
    
    document.getElementById('routingInfo').innerHTML = infoHtml;
}

// ============================================
// INTERFACE UTILISATEUR
// ============================================

/**
 * Affiche le panneau de contrôle du routage
 */
function showRoutingPanel() {
    // Créer le panneau s'il n'existe pas
    let panel = document.getElementById('routingPanel');
    if (!panel) {
        panel = createRoutingPanel();
    }
    
    panel.style.display = 'block';
    updateRoutingPanel();
}

/**
 * Crée le panneau de contrôle du routage
 * @returns {HTMLElement} Le panneau créé
 */
function createRoutingPanel() {
    const panel = document.createElement('div');
    panel.id = 'routingPanel';
    panel.className = 'routing-panel';
    panel.style.cssText = `
        position: fixed; top: 80px; right: 20px; width: 300px;
        background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000; padding: 20px; display: none;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #667eea;">
                <i class="fas fa-route"></i> Itinéraire
            </h3>
            <button onclick="disableRoutingMode()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div id="routingStatus" style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
            <p style="margin: 0; color: #666;">
                <i class="fas fa-info-circle"></i> 
                <span id="routingStatusText">Cliquez pour le point de départ</span>
            </p>
        </div>
        
        <div id="routingInfo"></div>
        
        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="resetRouting()" style="flex: 1; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-redo"></i> Réinitialiser
            </button>
            <button onclick="disableRoutingMode()" style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-times"></i> Fermer
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
    return panel;
}

/**
 * Met à jour le statut dans le panneau
 */
function updateRoutingPanel() {
    const statusText = document.getElementById('routingStatusText');
    const statusDiv = document.getElementById('routingStatus');
    
    if (!statusText) return;
    
    let text = '';
    let bgColor = '#f8f9fa';
    
    switch (routingStep) {
        case 'start':
            text = 'Cliquez pour le point de départ';
            bgColor = '#fff3cd';
            break;
        case 'end':
            text = 'Cliquez pour le point d\'arrivée';
            bgColor = '#d1ecf1';
            break;
        case 'complete':
            text = 'Itinéraire calculé';
            bgColor = '#d4edda';
            break;
    }
    
    statusText.textContent = text;
    statusDiv.style.background = bgColor;
}

/**
 * Réinitialise le routage
 */
function resetRouting() {
    // Supprimer les marqueurs
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    
    // Supprimer le contrôle de routage
    if (routingControl) {
        map.removeControl(routingControl);
    }
    
    // Réinitialiser l'état
    routingStep = 'start';
    
    // Vider les informations
    const infoDiv = document.getElementById('routingInfo');
    if (infoDiv) {
        infoDiv.innerHTML = '';
    }
    
    updateRoutingPanel();
    showNotification('Itinéraire réinitialisé', 'info');
}

/**
 * Désactive le mode de routage
 */
function disableRoutingMode() {
    isRoutingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', handleRoutingClick);
    
    // Supprimer les marqueurs et le contrôle
    resetRouting();
    
    // Cacher le panneau
    const panel = document.getElementById('routingPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// ============================================
// STYLES CSS
// ============================================

/**
 * Ajoute les styles CSS pour le routage
 */
function addRoutingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .routing-marker {
            background: #667eea; color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            border: 3px solid white;
        }
        .routing-start { background: #28a745; }
        .routing-end { background: #dc3545; }
        .leaflet-routing-container { display: none !important; }
    `;
    document.head.appendChild(style);
}

// ============================================
// INITIALISATION AUTOMATIQUE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    addRoutingStyles();
    initRoutingModule();
});

// ============================================
// EXPORT DES FONCTIONS
// ============================================

window.enableRoutingMode = enableRoutingMode;
window.disableRoutingMode = disableRoutingMode;
window.resetRouting = resetRouting;
