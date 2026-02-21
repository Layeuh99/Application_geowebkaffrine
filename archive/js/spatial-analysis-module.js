/**
 * Module d'Analyses Spatiales Améliorées - GéoWeb Kaffrine
 * Fonctionnalités avancées d'analyse spatiale
 */

// ============================================
// VARIABLES GLOBALES
// ============================================
let spatialAnalysisLayer = null;
let bufferLayer = null;
let measurementLayer = null;
let isDrawingMode = false;
let currentAnalysisType = null;

// ============================================
// FONCTIONS DE BUFFER
// ============================================

/**
 * Crée un buffer autour d'un point
 * @param {L.LatLng} center - Centre du buffer
 * @param {number} radius - Rayon en mètres
 * @param {string} layerName - Nom de la couche à analyser
 */
function createBufferAnalysis(center, radius, layerName) {
    // Supprimer les buffers précédents
    if (bufferLayer) {
        map.removeLayer(bufferLayer);
    }
    
    // Créer le cercle de buffer
    bufferLayer = L.circle(center, {
        radius: radius,
        fillColor: '#667eea',
        fillOpacity: 0.2,
        color: '#667eea',
        weight: 2
    }).addTo(map);
    
    // Ajouter un marqueur au centre
    L.marker(center).addTo(bufferLayer)
        .bindPopup(`Buffer de ${radius}m<br>Centre: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
    
    // Analyser les éléments dans le buffer
    analyzeFeaturesInBuffer(center, radius, layerName);
}

/**
 * Analyse les features présentes dans le buffer
 * @param {L.LatLng} center - Centre du buffer
 * @param {number} radius - Rayon en mètres
 * @param {string} layerName - Nom de la couche
 */
function analyzeFeaturesInBuffer(center, radius, layerName) {
    if (!geojsonData[layerName]) {
        showNotification('Aucune donnée disponible pour cette couche', 'warning');
        return;
    }
    
    const features = geojsonData[layerName].features;
    const results = [];
    
    features.forEach(feature => {
        if (isFeatureInBuffer(feature, center, radius)) {
            results.push(feature);
        }
    });
    
    displayBufferResults(results, layerName, radius);
}

/**
 * Vérifie si une feature est dans le buffer
 * @param {Object} feature - Feature GeoJSON
 * @param {L.LatLng} center - Centre du buffer
 * @param {number} radius - Rayon en mètres
 * @returns {boolean}
 */
function isFeatureInBuffer(feature, center, radius) {
    const coords = feature.geometry.coordinates;
    
    if (feature.geometry.type === 'Point') {
        const point = L.latLng(coords[1], coords[0]);
        return center.distanceTo(point) <= radius;
    } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        // Pour les polygones, vérifier si le centre est dans le polygone ou si le polygone intersecte le buffer
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();
        return bufferLayer.getBounds().intersects(bounds);
    }
    
    return false;
}

/**
 * Affiche les résultats du buffer
 * @param {Array} results - Features trouvées
 * @param {string} layerName - Nom de la couche
 * @param {number} radius - Rayon du buffer
 */
function displayBufferResults(results, layerName, radius) {
    const resultsDiv = document.getElementById('spatialAdvancedResultsContent');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Aucun élément trouvé dans un rayon de ${radius}m</p>
            </div>
        `;
    } else {
        let html = `
            <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #667eea;">
                    <i class="fas fa-check-circle"></i> ${results.length} élément(s) trouvé(s)
                </h4>
                <p style="margin: 5px 0 0 0; color: #666;">
                    Dans un rayon de ${radius}m - Couche: ${layerName}
                </p>
            </div>
            <div class="results-list">
        `;
        
        results.forEach((feature, index) => {
            const name = getFeatureName(feature);
            const distance = calculateDistance(feature, bufferLayer.getLatLng());
            
            html += `
                <div class="result-item" style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${name}</strong>
                            ${distance ? `<br><small style="color: #666;">Distance: ${distance}</small>` : ''}
                        </div>
                        <button onclick="zoomToFeature(${index})" class="btn-zoom" style="padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        resultsDiv.innerHTML = html;
    }
    
    document.getElementById('spatialAdvancedResults').style.display = 'block';
}

// ============================================
// FONCTIONS DE MESURE AMÉLIORÉE
// ============================================

/**
 * Active le mode de mesure amélioré
 */
function enableAdvancedMeasurement() {
    if (isDrawingMode) {
        disableAdvancedMeasurement();
        return;
    }
    
    isDrawingMode = true;
    map.getContainer().style.cursor = 'crosshair';
    
    showNotification('Cliquez sur la carte pour commencer à mesurer', 'info');
    
    map.on('click', handleMeasurementClick);
}

/**
 * Gère les clics pour la mesure
 * @param {Object} e - Événement de clic
 */
function handleMeasurementClick(e) {
    if (!isDrawingMode) return;
    
    const point = e.latlng;
    
    if (!measurementLayer) {
        measurementLayer = L.layerGroup().addTo(map);
    }
    
    // Ajouter un marqueur
    L.marker(point).addTo(measurementLayer);
    
    // Si c'est le premier point, commencer une ligne
    if (measurementLayer.getLayers().length === 1) {
        measurementLayer.currentLine = L.polyline([point], {
            color: '#667eea',
            weight: 3,
            opacity: 0.8
        }).addTo(measurementLayer);
        
        measurementLayer.points = [point];
    } else {
        // Ajouter le point à la ligne
        measurementLayer.points.push(point);
        measurementLayer.currentLine.setLatLngs(measurementLayer.points);
        
        // Calculer et afficher la distance
        const distance = calculateTotalDistance(measurementLayer.points);
        updateMeasurementDisplay(distance);
    }
}

/**
 * Calcule la distance totale d'un polygone
 * @param {Array} points - Points du polygone
 * @returns {number} Distance en mètres
 */
function calculateTotalDistance(points) {
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
        totalDistance += points[i-1].distanceTo(points[i]);
    }
    return totalDistance;
}

/**
 * Met à jour l'affichage de la mesure
 * @param {number} distance - Distance en mètres
 */
function updateMeasurementDisplay(distance) {
    const distanceKm = (distance / 1000).toFixed(2);
    const displayText = distance < 1000 ? 
        `${distance.toFixed(0)}m` : 
        `${distanceKm}km`;
    
    // Ajouter un popup sur le dernier marqueur
    const lastMarker = measurementLayer.getLayers()[measurementLayer.getLayers().length - 1];
    lastMarker.bindPopup(`Distance totale: ${displayText}`).openPopup();
    
    showNotification(`Distance: ${displayText}`, 'success');
}

/**
 * Désactive le mode de mesure
 */
function disableAdvancedMeasurement() {
    isDrawingMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', handleMeasurementClick);
    
    if (measurementLayer) {
        map.removeLayer(measurementLayer);
        measurementLayer = null;
    }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtient le nom d'une feature
 * @param {Object} feature - Feature GeoJSON
 * @returns {string} Nom de la feature
 */
function getFeatureName(feature) {
    const props = feature.properties;
    
    // Chercher différents champs de nom possibles
    const nameFields = ['Nom', 'nom', 'name', 'Région', 'Département', 'Arrondissement', 'LOCALITE'];
    
    for (const field of nameFields) {
        if (props[field]) {
            return props[field];
        }
    }
    
    return 'Sans nom';
}

/**
 * Calcule la distance entre une feature et un point
 * @param {Object} feature - Feature GeoJSON
 * @param {L.LatLng} point - Point de référence
 * @returns {string} Distance formatée
 */
function calculateDistance(feature, point) {
    if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates;
        const featurePoint = L.latLng(coords[1], coords[0]);
        const distance = point.distanceTo(featurePoint);
        
        return distance < 1000 ? 
            `${distance.toFixed(0)}m` : 
            `${(distance / 1000).toFixed(2)}km`;
    }
    
    return null;
}

/**
 * Zoom sur une feature spécifique
 * @param {number} index - Index de la feature dans les résultats
 */
function zoomToFeature(index) {
    // Cette fonction nécessiterait une référence aux résultats actuels
    // Pour l'instant, nous allons simplement logger l'action
    console.log(`Zoom sur la feature ${index}`);
}

/**
 * Affiche une notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (info, success, warning, error)
 */
function showNotification(message, type = 'info') {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : type === 'error' ? 'times' : 'info'}-circle"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// EXPORT DES FONCTIONS
// ============================================

window.createBufferAnalysis = createBufferAnalysis;
window.enableAdvancedMeasurement = enableAdvancedMeasurement;
window.disableAdvancedMeasurement = disableAdvancedMeasurement;
