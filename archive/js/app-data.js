// FONCTIONS ESSENTIELLES POUR LES DONNÉES DE LA CARTE
// ============================================

// Variables globales pour la carte
let map;
let layers = {};
let clusters = {};
let geojsonData = {};

// Initialisation de la carte
function initMap() {
    if (map) {
        console.log('[APP] Carte déjà initialisée');
        return;
    }
    
    map = L.map('map', {
        center: [14.5, -15.0],
        zoom: 8,
        zoomControl: true
    });
    
    // Ajouter les couches de base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    console.log('[APP] Carte initialisée');
}

// Initialisation des couches
function initLayers() {
    // Créer les panes pour les couches
    function createPane(name, zIndex) {
        if (!map.getPane(name)) {
            map.createPane(name);
            map.getPane(name).style.zIndex = zIndex;
        }
    }
    
    createPane('CartoDbDarkMatter', 400);
    createPane('GoogleHybrid', 401);
    createPane('OSMStandard', 402);
    createPane('Region', 500);
    createPane('Departement', 501);
    createPane('Arrondissement', 502);
    createPane('Routes', 503);
    createPane('Localites', 504);
    createPane('Ecoles', 505);
    
    console.log('[LAYER] Panes créées');
}

// Chargement des données
function initDataLayers() {
    console.log('[DATA] Chargement des données...');
    
    // Couche Region
    if (typeof Region_3 !== 'undefined') {
        layers.Region = L.geoJson(Region_3, {
            style: {
                color: '#ff6b6b',
                weight: 2,
                fillOpacity: 0.3
            }
        }).addTo(map);
        console.log('[DATA] Couche Region chargée');
    }
    
    // Couche Departement
    if (typeof Departement_4 !== 'undefined') {
        layers.Departement = L.geoJson(Departement_4, {
            style: {
                color: '#4ecdc4',
                weight: 2,
                fillOpacity: 0.3
            }
        }).addTo(map);
        console.log('[DATA] Couche Departement chargée');
    }
    
    // Couche Arrondissement
    if (typeof Arrondissement_5 !== 'undefined') {
        layers.Arrondissement = L.geoJson(Arrondissement_5, {
            style: {
                color: '#45b7d1',
                weight: 1,
                fillOpacity: 0.2
            }
        }).addTo(map);
        console.log('[DATA] Couche Arrondissement chargée');
    }
    
    // Couche Routes
    if (typeof Routes_6 !== 'undefined') {
        layers.Routes = L.geoJson(Routes_6, {
            style: {
                color: '#666',
                weight: 2
            }
        }).addTo(map);
        console.log('[DATA] Couche Routes chargée');
    }
    
    // Cluster pour les Localites
    if (typeof Localites_7 !== 'undefined') {
        clusters.Localites = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div style="background-color: #535353; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">' + cluster.getChildCount() + '</div>',
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30]
                });
            }
        });
        
        L.geoJson(Localites_7, {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng);
            }
        }).eachLayer(function(layer) {
            clusters.Localites.addLayer(layer);
        });
        
        clusters.Localites.addTo(map);
        console.log('[DATA] Couche Localites chargée avec clusters');
    }
    
    // Cluster pour les Ecoles
    if (typeof Ecoles_8 !== 'undefined') {
        clusters.Ecoles = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: '<div style="background-color: #b80808; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">' + cluster.getChildCount() + '</div>',
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30]
                });
            }
        });
        
        L.geoJson(Ecoles_8, {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng);
            }
        }).eachLayer(function(layer) {
            clusters.Ecoles.addLayer(layer);
        });
        
        clusters.Ecoles.addTo(map);
        console.log('[DATA] Couche Ecoles chargée avec clusters');
    }
    
    console.log('[DATA] Toutes les couches de données chargées avec succès');
}

// Contrôle des couches
function initLayerControl() {
    let overlaysTree = [
        {label: '🎓 Ecoles', layer: clusters.Ecoles || layers.Ecoles},
        {label: '📍 Localites', layer: clusters.Localites || layers.Localites},
        {label: '🛣️ Routes', layer: layers.Routes},
        {label: '🏛️ Arrondissements', layer: layers.Arrondissement},
        {label: '🏢 Départements', layer: layers.Departement},
        {label: '🗺️ Région', layer: layers.Region}
    ];
    
    let baseLayers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    };
    
    L.control.layers.tree(baseLayers, overlaysTree, {
        closedSymbol: '🔽',
        openedSymbol: '🔼',
        spaceEllipsis: false,
        selectAllCheckbox: false,
        containerExpandHover: true
    }).addTo(map);
    
    console.log('[LAYER CONTROL] Contrôle des couches créé');
}

// Initialisation principale
function initializeApp() {
    console.log('[APP] Initialisation de l\'application...');
    
    // Attendre que les données soient chargées
    if (typeof Region_3 === 'undefined' || typeof Departement_4 === 'undefined') {
        console.log('[APP] En attente des données...');
        setTimeout(initializeApp, 500);
        return;
    }
    
    initMap();
    initLayers();
    initDataLayers();
    initLayerControl();
    
    console.log('[APP] Application initialisée avec succès');
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('[APP] DOM chargé, démarrage de l\'initialisation...');
    initializeApp();
});
