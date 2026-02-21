// VERSION SIMPLIFIÉE MAIS FONCTIONNELLE
// ============================================

// Variables globales
let map;
let layers = {};
let clusters = {};

// Initialisation rapide
function initMap() {
    map = L.map('map', {
        center: [14.5, -15.0],
        zoom: 8
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    // Charger les données si elles existent
    if (typeof Region_3 !== 'undefined') {
        layers.Region = L.geoJson(Region_3, {
            style: {color: '#ff6b6b', weight: 2, fillOpacity: 0.3}
        }).addTo(map);
    }
    
    if (typeof Departement_4 !== 'undefined') {
        layers.Departement = L.geoJson(Departement_4, {
            style: {color: '#4ecdc4', weight: 2, fillOpacity: 0.3}
        }).addTo(map);
    }
    
    if (typeof Arrondissement_5 !== 'undefined') {
        layers.Arrondissement = L.geoJson(Arrondissement_5, {
            style: {color: '#45b7d1', weight: 1, fillOpacity: 0.2}
        }).addTo(map);
    }
    
    if (typeof Routes_6 !== 'undefined') {
        layers.Routes = L.geoJson(Routes_6, {
            style: {color: '#666', weight: 2}
        }).addTo(map);
    }
    
    // Écoles et localités avec clusters
    if (typeof L.markerClusterGroup !== 'undefined') {
        if (typeof Ecoles_8 !== 'undefined') {
            clusters.Ecoles = L.markerClusterGroup();
            L.geoJson(Ecoles_8).eachLayer(function(layer) {
                clusters.Ecoles.addLayer(layer);
            });
            clusters.Ecoles.addTo(map);
        }
        
        if (typeof Localites_7 !== 'undefined') {
            clusters.Localites = L.markerClusterGroup();
            L.geoJson(Localites_7).eachLayer(function(layer) {
                clusters.Localites.addLayer(layer);
            });
            clusters.Localites.addTo(map);
        }
    }
    
    console.log('[APP] Carte et données chargées');
}

// Fonctions FAB
function toggleFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const fabButton = document.getElementById('fabButton');
    
    if (!fabMenu || !fabButton) return;
    
    if (fabMenu.classList.contains('active')) {
        fabMenu.classList.remove('active');
        fabMenu.style.opacity = '0';
        fabMenu.style.visibility = 'hidden';
        fabButton.innerHTML = '<span style="color: white; font-size: 1.8rem;">⚡</span>';
    } else {
        fabMenu.classList.add('active');
        fabMenu.style.opacity = '1';
        fabMenu.style.visibility = 'visible';
        fabButton.innerHTML = '<span style="color: white; font-size: 1.8rem;">✖️</span>';
        
        const items = fabMenu.querySelectorAll('.fab-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateX(0)';
                item.style.opacity = '1';
            }, index * 50);
        });
    }
}

function closeFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const fabButton = document.getElementById('fabButton');
    
    if (!fabMenu || !fabButton) return;
    
    fabMenu.classList.remove('active');
    fabMenu.style.opacity = '0';
    fabMenu.style.visibility = 'hidden';
    fabButton.innerHTML = '<span style="color: white; font-size: 1.8rem;">⚡</span>';
}

function showSpatialQuery() {
    alert('Recherche spatiale : Utilisez les outils de la carte pour analyser les données');
    closeFabMenu();
}

function enableRoutingMode() {
    alert('Mode itinéraire : Cliquez sur la carte pour définir un trajet');
    closeFabMenu();
}

function showAttributeQuery() {
    alert('Recherche d\'attributs : Utilisez le contrôle des couches pour filtrer les données');
    closeFabMenu();
}

function toggleMeasure() {
    alert('Mesure : Utilisez les outils de la carte pour mesurer des distances');
    closeFabMenu();
}

function showMiniTutorial() {
    alert('Tutoriel : Bienvenue sur l\'application géographique de Kaffrine !\n\nExplorez les données géographiques avec les contrôles de couches.');
    closeFabMenu();
}

// Démarrage
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initMap, 1000);
});
