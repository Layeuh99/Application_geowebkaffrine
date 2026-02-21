/**
 * Module Core de la Carte - GéoWeb Kaffrine
 * Modularisation de l'initialisation et gestion de la carte
 * Réduction de la dépendance à qgis2web
 */

// ============================================
// VARIABLES GLOBALES DU MODULE
// ============================================
const MapCore = {
    map: null,
    layers: {},
    controls: {},
    bounds: null,
    isInitialized: false
};

// ============================================
// CONFIGURATION DE LA CARTE
// ============================================

const MAP_CONFIG = {
    center: [14.6814, -15.0407], // Centre de la région de Kaffrine
    zoom: 9,
    minZoom: 6,
    maxZoom: 18,
    defaultBasemap: 'OSMStandard',
    basemaps: {
        'OSMStandard': {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            options: {
                maxZoom: 19
            }
        },
        'GoogleHybrid': {
            url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            attribution: '© Google Maps',
            options: {
                maxZoom: 20
            }
        },
        'CartoDbDarkMatter': {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '© CartoDB',
            options: {
                maxZoom: 19
            }
        }
    }
};

// ============================================
// INITIALISATION DE LA CARTE
// ============================================

/**
 * Initialise la carte principale
 * @returns {L.Map} L'instance de la carte
 */
function initializeMap() {
    if (MapCore.isInitialized) {
        console.warn('La carte est déjà initialisée');
        return MapCore.map;
    }
    
    // Créer la carte
    MapCore.map = L.map('map', {
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        zoomControl: false // On va créer un contrôle personnalisé
    });
    
    // Ajouter le fond de carte par défaut
    addDefaultBasemap();
    
    // Ajouter les contrôles
    addMapControls();
    
    // Configurer l'attribution
    setupAttribution();
    
    // Marquer comme initialisée
    MapCore.isInitialized = true;
    
    console.log('Carte initialisée avec succès');
    return MapCore.map;
}

/**
 * Ajoute le fond de carte par défaut
 */
function addDefaultBasemap() {
    const basemapConfig = MAP_CONFIG.basemaps[MAP_CONFIG.defaultBasemap];
    const basemap = L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        ...basemapConfig.options
    });
    
    basemap.addTo(MapCore.map);
    MapCore.layers.currentBasemap = basemap;
}

/**
 * Ajoute les contrôles de la carte
 */
function addMapControls() {
    // Contrôle de zoom personnalisé
    L.control.zoom({
        position: 'topright'
    }).addTo(MapCore.map);
    
    // Contrôle d'échelle
    L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(MapCore.map);
}

/**
 * Configure l'attribution de la carte
 */
function setupAttribution() {
    MapCore.map.attributionControl.setPrefix(
        '<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; ' +
        '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; ' +
        '<a href="https://qgis.org">QGIS</a>'
    );
}

// ============================================
// GESTION DES FONDS DE CARTE
// ============================================

/**
 * Change le fond de carte
 * @param {string} basemapName - Nom du fond de carte
 */
function changeBasemap(basemapName) {
    if (!MAP_CONFIG.basemaps[basemapName]) {
        console.error('Fond de carte non trouvé:', basemapName);
        return;
    }
    
    // Supprimer le fond de carte actuel
    if (MapCore.layers.currentBasemap) {
        MapCore.map.removeLayer(MapCore.layers.currentBasemap);
    }
    
    // Ajouter le nouveau fond de carte
    const basemapConfig = MAP_CONFIG.basemaps[basemapName];
    const newBasemap = L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        ...basemapConfig.options
    });
    
    newBasemap.addTo(MapCore.map);
    MapCore.layers.currentBasemap = newBasemap;
    
    // Mettre à jour l'interface
    updateBasemapUI(basemapName);
    
    console.log('Fond de carte changé vers:', basemapName);
}

/**
 * Met à jour l'interface utilisateur pour le fond de carte
 * @param {string} basemapName - Nom du fond de carte actif
 */
function updateBasemapUI(basemapName) {
    // Retirer la classe active de toutes les options
    document.querySelectorAll('.basemap-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Ajouter la classe active à l'option sélectionnée
    const selectedOption = document.querySelector(`.basemap-option[onclick="changeBasemap('${basemapName}')"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
}

// ============================================
// GESTION DES COUCHES
// ============================================

/**
 * Ajoute une couche à la carte
 * @param {string} layerName - Nom de la couche
 * @param {L.Layer} layer - Instance de la couche Leaflet
 * @param {Object} options - Options de la couche
 */
function addLayer(layerName, layer, options = {}) {
    if (MapCore.layers[layerName]) {
        console.warn('La couche existe déjà:', layerName);
        return;
    }
    
    // Ajouter les options par défaut
    const layerOptions = {
        visible: true,
        opacity: 1.0,
        zIndex: 100,
        ...options
    };
    
    // Configurer la couche
    if (layer.setOpacity) {
        layer.setOpacity(layerOptions.opacity);
    }
    if (layer.setZIndex) {
        layer.setZIndex(layerOptions.zIndex);
    }
    
    // Ajouter à la carte si visible
    if (layerOptions.visible) {
        layer.addTo(MapCore.map);
    }
    
    // Stocker la couche
    MapCore.layers[layerName] = {
        layer: layer,
        options: layerOptions
    };
    
    console.log('Couche ajoutée:', layerName);
}

/**
 * Supprime une couche de la carte
 * @param {string} layerName - Nom de la couche
 */
function removeLayer(layerName) {
    if (!MapCore.layers[layerName]) {
        console.warn('Couche non trouvée:', layerName);
        return;
    }
    
    const layerData = MapCore.layers[layerName];
    
    // Supprimer de la carte
    if (layerData.layer && MapCore.map.hasLayer(layerData.layer)) {
        MapCore.map.removeLayer(layerData.layer);
    }
    
    // Supprimer du stockage
    delete MapCore.layers[layerName];
    
    console.log('Couche supprimée:', layerName);
}

/**
 * Bascule la visibilité d'une couche
 * @param {string} layerName - Nom de la couche
 */
function toggleLayer(layerName) {
    if (!MapCore.layers[layerName]) {
        console.warn('Couche non trouvée:', layerName);
        return;
    }
    
    const layerData = MapCore.layers[layerName];
    
    if (MapCore.map.hasLayer(layerData.layer)) {
        MapCore.map.removeLayer(layerData.layer);
        layerData.options.visible = false;
    } else {
        layerData.layer.addTo(MapCore.map);
        layerData.options.visible = true;
    }
    
    console.log('Visibilité de la couche basculée:', layerName, layerData.options.visible);
}

/**
 * Met à jour l'opacité d'une couche
 * @param {string} layerName - Nom de la couche
 * @param {number} opacity - Opacité (0-1)
 */
function setLayerOpacity(layerName, opacity) {
    if (!MapCore.layers[layerName]) {
        console.warn('Couche non trouvée:', layerName);
        return;
    }
    
    const layerData = MapCore.layers[layerName];
    
    if (layerData.layer.setOpacity) {
        layerData.layer.setOpacity(opacity);
        layerData.options.opacity = opacity;
    }
}

// ============================================
// GESTION DES LIMITES ET CENTRAGE
// ============================================

/**
 * Définit les limites de la carte
 * @param {L.LatLngBounds} bounds - Limites géographiques
 */
function setMapBounds(bounds) {
    MapCore.bounds = bounds;
    
    // Ajuster la vue aux limites si la carte est initialisée
    if (MapCore.isInitialized) {
        MapCore.map.fitBounds(bounds, {
            padding: [20, 20]
        });
    }
}

/**
 * Centre la carte sur les limites définies
 */
function centerMap() {
    if (MapCore.bounds && MapCore.isInitialized) {
        MapCore.map.fitBounds(MapCore.bounds, {
            padding: [20, 20]
        });
    } else if (MapCore.isInitialized) {
        // Centre par défaut si aucune limite n'est définie
        MapCore.map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
    }
}

/**
 * Réinitialise le zoom à la vue complète
 */
function resetZoom() {
    centerMap();
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Obtient l'instance de la carte
 * @returns {L.Map|null} Instance de la carte
 */
function getMap() {
    return MapCore.map;
}

/**
 * Obtient une couche spécifique
 * @param {string} layerName - Nom de la couche
 * @returns {L.Layer|null} Instance de la couche
 */
function getLayer(layerName) {
    const layerData = MapCore.layers[layerName];
    return layerData ? layerData.layer : null;
}

/**
 * Obtient toutes les couches
 * @returns {Object} Objet contenant toutes les couches
 */
function getAllLayers() {
    return MapCore.layers;
}

/**
 * Vérifie si la carte est initialisée
 * @returns {boolean} True si la carte est initialisée
 */
function isMapInitialized() {
    return MapCore.isInitialized;
}

/**
 * Détruit la carte et nettoie les ressources
 */
function destroyMap() {
    if (MapCore.map) {
        MapCore.map.remove();
        MapCore.map = null;
        MapCore.layers = {};
        MapCore.controls = {};
        MapCore.bounds = null;
        MapCore.isInitialized = false;
        
        console.log('Carte détruite');
    }
}

// ============================================
// EXPORT DES FONCTIONS
// ============================================

// Fonctions principales
window.initializeMap = initializeMap;
window.changeBasemap = changeBasemap;
window.centerMap = centerMap;
window.resetZoom = resetZoom;

// Gestion des couches
window.addLayer = addLayer;
window.removeLayer = removeLayer;
window.toggleLayer = toggleLayer;
window.setLayerOpacity = setLayerOpacity;

// Utilitaires
window.getMap = getMap;
window.getLayer = getLayer;
window.getAllLayers = getAllLayers;
window.isMapInitialized = isMapInitialized;
window.destroyMap = destroyMap;

// Configuration
window.MAP_CONFIG = MAP_CONFIG;
