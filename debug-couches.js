// ============================================
// DEBUG DES COUCHES - Script de diagnostic
// ============================================

console.log('[DEBUG-COUCHES] Démarrage du diagnostic des couches...');

// Variables globales pour le debug
let debugInfo = {
    layersCount: 0,
    layersCreated: [],
    layerControlCalled: 0,
    containerFound: false,
    containerContent: ''
};

// Fonction pour vérifier l'état des couches
function checkLayersState() {
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log('[DEBUG-COUCHES] ÉTAT DES COUCHES');
    console.log('[DEBUG-COUCHES] ===========================================');
    
    // Vérifier si l'objet layers existe
    if (typeof layers === 'undefined') {
        console.error('[DEBUG-COUCHES] ❌ Objet "layers" non défini');
        return;
    } else {
        console.log('[DEBUG-COUCHES] ✅ Objet "layers" défini');
    }
    
    // Compter et lister les couches
    const layerNames = Object.keys(layers);
    debugInfo.layersCount = layerNames.length;
    debugInfo.layersCreated = layerNames;
    
    console.log(`[DEBUG-COUCHES] 📊 Nombre de couches: ${layerNames.length}`);
    console.log('[DEBUG-COUCHES] 📋 Couches créées:');
    
    layerNames.forEach((name, index) => {
        const layer = layers[name];
        const hasLayer = map && map.hasLayer ? map.hasLayer(layer) : 'N/A';
        const layerType = layer instanceof L.GeoJSON ? 'GeoJSON' : 
                         layer instanceof L.TileLayer ? 'TileLayer' : 
                         layer instanceof L.MarkerClusterGroup ? 'Cluster' : 'Unknown';
        
        console.log(`  ${index + 1}. ${name} (${layerType}) - Sur la carte: ${hasLayer}`);
    });
    
    // Vérifier les clusters
    if (typeof clusters !== 'undefined') {
        const clusterNames = Object.keys(clusters);
        console.log(`[DEBUG-COUCHES] 📊 Nombre de clusters: ${clusterNames.length}`);
        console.log('[DEBUG-COUCHES] 📋 Clusters créés:');
        clusterNames.forEach((name, index) => {
            console.log(`  ${index + 1}. ${name}`);
        });
    } else {
        console.log('[DEBUG-COUCHES] ⚠️ Objet "clusters" non défini');
    }
    
    console.log('[DEBUG-COUCHES] ===========================================');
}

// Fonction pour vérifier le conteneur du contrôle
function checkLayerControlContainer() {
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log('[DEBUG-COUCHES] CONTENEUR DU CONTRÔLE');
    console.log('[DEBUG-COUCHES] ===========================================');
    
    const container = document.getElementById('layerControlContainer');
    
    if (!container) {
        console.error('[DEBUG-COUCHES] ❌ Conteneur "layerControlContainer" non trouvé');
        debugInfo.containerFound = false;
        return;
    } else {
        console.log('[DEBUG-COUCHES] ✅ Conteneur "layerControlContainer" trouvé');
        debugInfo.containerFound = true;
        
        // Vérifier le contenu
        const content = container.innerHTML.trim();
        debugInfo.containerContent = content;
        
        if (content === '' || content === '<!-- Le controle des couches sera injecte ici -->') {
            console.log('[DEBUG-COUCHES] ⚠️ Conteneur vide - contrôle non injecté');
        } else {
            console.log('[DEBUG-COUCHES] ✅ Conteneur contient du HTML');
            console.log('[DEBUG-COUCHES] 📄 Contenu (premiers 200 caractères):', content.substring(0, 200) + '...');
        }
        
        // Compter les éléments de couches
        const layerItems = container.querySelectorAll('.layer-item, .layer-item-with-opacity');
        console.log(`[DEBUG-COUCHES] 📊 Éléments de couches trouvés: ${layerItems.length}`);
        
        const layerSections = container.querySelectorAll('.layer-section');
        console.log(`[DEBUG-COUCHES] 📊 Sections de couches trouvées: ${layerSections.length}`);
    }
    
    console.log('[DEBUG-COUCHES] ===========================================');
}

// Fonction pour vérifier les appels à initLayerControl
function checkInitLayerControlCalls() {
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log('[DEBUG-COUCHES] APPELS À INITLAYERCONTROL');
    console.log('[DEBUG-COUCHES] ===========================================');
    
    // Vérifier si la fonction existe
    if (typeof initLayerControl === 'function') {
        console.log('[DEBUG-COUCHES] ✅ Fonction initLayerControl définie');
        
        // Afficher le code de la fonction (premières lignes)
        const funcStr = initLayerControl.toString();
        const firstLines = funcStr.split('\n').slice(0, 10).join('\n');
        console.log('[DEBUG-COUCHES] 📄 Début de la fonction:');
        console.log(firstLines);
        
        // Vérifier si c'est la bonne fonction (celle qui crée le contrôle)
        if (funcStr.includes('createCustomLayerControl')) {
            console.log('[DEBUG-COUCHES] ✅ Bonne fonction trouvée (crée le contrôle personnalisé)');
        } else {
            console.log('[DEBUG-COUCHES] ❌ Mauvaise fonction (probablement celle qui synchronise les checkboxes)');
        }
    } else {
        console.error('[DEBUG-COUCHES] ❌ Fonction initLayerControl non définie');
    }
    
    console.log('[DEBUG-COUCHES] ===========================================');
}

// Fonction pour tester manuellement la création du contrôle
function testManualLayerControl() {
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log('[DEBUG-COUCHES] TEST MANUEL DU CONTRÔLE');
    console.log('[DEBUG-COUCHES] ===========================================');
    
    if (typeof layers === 'undefined' || typeof map === 'undefined') {
        console.error('[DEBUG-COUCHES] ❌ Layers ou map non définis');
        return;
    }
    
    // Créer les arbres de couches
    let overlaysTree = [
        {label: '<i class="fas fa-graduation-cap" style="color: #b80808;"></i> Ecoles', layer: clusters.Ecoles || layers.Ecoles},
        {label: '<i class="fas fa-map-marker-alt" style="color: #535353;"></i> Localites', layer: clusters.Localites || layers.Localites},
        {label: '<i class="fas fa-road" style="color: #ff0000;"></i> Routes', layer: layers.Routes},
        {label: '<i class="fas fa-draw-polygon" style="color: #667eea;"></i> Arrondissement', layer: layers.Arrondissement},
        {label: '<i class="fas fa-draw-polygon" style="color: #764ba2;"></i> Departement', layer: layers.Departement},
        {label: '<i class="fas fa-draw-polygon" style="color: #333;"></i> Region', layer: layers.Region}
    ];

    let baseTree = [
        {label: 'OpenStreetMap', layer: layers.OSMStandard, radioGroup: 'bm'},
        {label: 'Google Hybrid', layer: layers.GoogleHybrid, radioGroup: 'bm'},
        {label: 'CartoDB Dark', layer: layers.CartoDbDarkMatter, radioGroup: 'bm'}
    ];
    
    console.log('[DEBUG-COUCHES] 📊 Arbres de couches créés:');
    console.log(`  - overlaysTree: ${overlaysTree.length} couches`);
    console.log(`  - baseTree: ${baseTree.length} fonds de carte`);
    
    // Vérifier que les couches existent
    overlaysTree.forEach((item, index) => {
        const exists = item.layer && typeof item.layer.addTo === 'function';
        console.log(`  ${index + 1}. ${item.label.replace(/<[^>]*>/g, '').trim()}: ${exists ? '✅' : '❌'}`);
    });
    
    // Appeler createCustomLayerControl si elle existe
    const container = document.getElementById('layerControlContainer');
    if (container && typeof createCustomLayerControl === 'function') {
        console.log('[DEBUG-COUCHES] 📞 Appel de createCustomLayerControl...');
        createCustomLayerControl(container, baseTree, overlaysTree);
        console.log('[DEBUG-COUCHES] ✅ createCustomLayerControl appelée');
        
        // Vérifier le résultat
        setTimeout(() => {
            checkLayerControlContainer();
        }, 100);
    } else {
        console.error('[DEBUG-COUCHES] ❌ Conteneur ou fonction createCustomLayerControl non trouvé');
    }
    
    console.log('[DEBUG-COUCHES] ===========================================');
}

// Fonction de diagnostic complet
function fullLayerDebug() {
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log('[DEBUG-COUCHES] DIAGNOSTIC COMPLET DES COUCHES');
    console.log('[DEBUG-COUCHES] ===========================================');
    
    checkLayersState();
    checkLayerControlContainer();
    checkInitLayerControlCalls();
    
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log('[DEBUG-COUCHES] RÉSUMÉ DU DIAGNOSTIC');
    console.log('[DEBUG-COUCHES] ===========================================');
    console.log(`[DEBUG-COUCHES] 📊 Couches créées: ${debugInfo.layersCount}`);
    console.log(`[DEBUG-COUCHES] 📋 Noms: ${debugInfo.layersCreated.join(', ')}`);
    console.log(`[DEBUG-COUCHES] 📦 Conteneur trouvé: ${debugInfo.containerFound ? '✅' : '❌'}`);
    console.log(`[DEBUG-COUCHES] 📄 Contenu du conteneur: ${debugInfo.containerContent.length > 0 ? '✅' : '❌'}`);
    
    if (debugInfo.layersCount > 0 && debugInfo.containerFound) {
        console.log('[DEBUG-COUCHES] 💡 Suggestion: Appeler testManualLayerControl() pour forcer la création');
    } else if (debugInfo.layersCount === 0) {
        console.log('[DEBUG-COUCHES] ❌ Problème: Aucune couche créée - vérifier initDataLayers()');
    } else if (!debugInfo.containerFound) {
        console.log('[DEBUG-COUCHES] ❌ Problème: Conteneur non trouvé - vérifier le HTML');
    }
    
    console.log('[DEBUG-COUCHES] ===========================================');
}

// Intercepter les appels à initLayerControl
if (typeof initLayerControl === 'function') {
    const originalInitLayerControl = initLayerControl;
    initLayerControl = function() {
        debugInfo.layerControlCalled++;
        console.log(`[DEBUG-COUCHES] 📞 initLayerControl appelée (fois: ${debugInfo.layerControlCalled})`);
        
        // Appeler la fonction originale
        const result = originalInitLayerControl.apply(this, arguments);
        
        // Vérifier le résultat après un court délai
        setTimeout(() => {
            checkLayerControlContainer();
        }, 100);
        
        return result;
    };
}

// Rendre les fonctions disponibles globalement
window.fullLayerDebug = fullLayerDebug;
window.testManualLayerControl = testManualLayerControl;
window.checkLayersState = checkLayersState;
window.checkLayerControlContainer = checkLayerControlContainer;

console.log('[DEBUG-COUCHES] Script de diagnostic chargé. Utilisez:');
console.log('[DEBUG-COUCHES] - fullLayerDebug() pour le diagnostic complet');
console.log('[DEBUG-COUCHES] - testManualLayerControl() pour tester manuellement');
console.log('[DEBUG-COUCHES] - checkLayersState() pour vérifier les couches');
console.log('[DEBUG-COUCHES] - checkLayerControlContainer() pour vérifier le conteneur');

// Diagnostic automatique après 3 secondes
setTimeout(() => {
    console.log('[DEBUG-COUCHES] 🚀 Lancement du diagnostic automatique...');
    fullLayerDebug();
}, 3000);
