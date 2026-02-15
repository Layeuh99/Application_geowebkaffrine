/**
 * Module d'Analyses Améliorées - GéoWeb Kaffrine
 * Buffer simple et filtrage interactif
 */

let analysisLayer = null;
let bufferCircle = null;
let isAnalysisMode = false;

/**
 * Active le mode d'analyse amélioré
 */
function enableImprovedAnalysis() {
    if (isAnalysisMode) {
        disableImprovedAnalysis();
        return;
    }
    
    isAnalysisMode = true;
    map.getContainer().style.cursor = 'crosshair';
    
    showNotification('Cliquez sur la carte pour créer un buffer d\'analyse', 'info');
    map.on('click', handleAnalysisClick);
}

/**
 * Gère les clics pour l'analyse
 */
function handleAnalysisClick(e) {
    if (!isAnalysisMode) return;
    
    const center = e.latlng;
    createSimpleBuffer(center, 1000); // 1km par défaut
}

/**
 * Crée un buffer simple autour d'un point
 */
function createSimpleBuffer(center, radius) {
    // Supprimer le buffer précédent
    if (bufferCircle) {
        map.removeLayer(bufferCircle);
    }
    
    // Créer le cercle de buffer
    bufferCircle = L.circle(center, {
        radius: radius,
        fillColor: '#667eea',
        fillOpacity: 0.2,
        color: '#667eea',
        weight: 2
    }).addTo(map);
    
    // Analyser les features dans le buffer
    analyzeFeaturesInSimpleBuffer(center, radius);
}

/**
 * Analyse les features dans le buffer simple
 */
function analyzeFeaturesInSimpleBuffer(center, radius) {
    const results = [];
    
    // Analyser chaque couche
    Object.keys(geojsonData).forEach(layerName => {
        if (geojsonData[layerName]) {
            const features = geojsonData[layerName].features;
            const layerResults = features.filter(feature => {
                return isFeatureInSimpleBuffer(feature, center, radius);
            });
            
            if (layerResults.length > 0) {
                results.push({
                    layer: layerName,
                    count: layerResults.length,
                    features: layerResults
                });
            }
        }
    });
    
    displaySimpleBufferResults(results, radius);
}

/**
 * Vérifie si une feature est dans le buffer
 */
function isFeatureInSimpleBuffer(feature, center, radius) {
    if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates;
        const point = L.latLng(coords[1], coords[0]);
        return center.distanceTo(point) <= radius;
    }
    return false;
}

/**
 * Affiche les résultats du buffer simple
 */
function displaySimpleBufferResults(results, radius) {
    let html = `
        <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0; color: #667eea;">
                <i class="fas fa-search"></i> Résultats du buffer (${radius}m)
            </h4>
        </div>
    `;
    
    if (results.length === 0) {
        html += '<p>Aucun élément trouvé dans cette zone.</p>';
    } else {
        results.forEach(result => {
            html += `
                <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e0e0e0;">
                    <h5 style="margin: 0 0 8px 0; color: #333;">
                        <i class="fas fa-layer-group"></i> ${result.layer}
                        <span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 8px;">
                            ${result.count} éléments
                        </span>
                    </h5>
                    <button onclick="filterLayer('${result.layer}')" style="padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-filter"></i> Filtrer cette couche
                    </button>
                </div>
            `;
        });
    }
    
    // Afficher dans un modal ou panneau
    showAnalysisResults(html);
}

/**
 * Filtre une couche spécifique
 */
function filterLayer(layerName) {
    showNotification(`Filtrage de la couche: ${layerName}`, 'info');
    // Implémenter le filtrage ici
}

/**
 * Affiche les résultats d'analyse
 */
function showAnalysisResults(html) {
    // Créer ou mettre à jour le modal de résultats
    let modal = document.getElementById('analysisResultsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'analysisResultsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="closeAnalysisResults()">&times;</span>
                <h2><i class="fas fa-chart-line"></i> Résultats d'Analyse</h2>
                <div id="analysisResultsContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('analysisResultsContent').innerHTML = html;
    modal.style.display = 'block';
}

/**
 * Ferme les résultats d'analyse
 */
function closeAnalysisResults() {
    const modal = document.getElementById('analysisResultsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Désactive le mode d'analyse
 */
function disableImprovedAnalysis() {
    isAnalysisMode = false;
    map.getContainer().style.cursor = '';
    map.off('click', handleAnalysisClick);
    
    if (bufferCircle) {
        map.removeLayer(bufferCircle);
        bufferCircle = null;
    }
}

// Export des fonctions
window.enableImprovedAnalysis = enableImprovedAnalysis;
window.disableImprovedAnalysis = disableImprovedAnalysis;
window.closeAnalysisResults = closeAnalysisResults;
