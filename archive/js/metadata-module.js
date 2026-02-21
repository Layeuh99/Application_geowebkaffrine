/**
 * Module Métadonnées - GéoWeb Kaffrine
 * Gestion de l'affichage des métadonnées structurées
 */

// ============================================
// FONCTIONS PUBLIQUES
// ============================================

/**
 * Affiche le modal des métadonnées
 */
function showMetadata() {
    document.getElementById('metadataModal').style.display = 'block';
    // Affiche le premier onglet par défaut
    showMetadataTab('general');
}

/**
 * Affiche un onglet spécifique des métadonnées
 * @param {string} tabName - Nom de l'onglet à afficher
 */
function showMetadataTab(tabName) {
    // Masquer tous les contenus
    const contents = document.querySelectorAll('.metadata-content');
    contents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Désactiver tous les onglets
    const tabs = document.querySelectorAll('.metadata-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher le contenu sélectionné
    const selectedContent = document.getElementById('metadata' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Activer l'onglet sélectionné
    const selectedTab = Array.from(tabs).find(tab => 
        tab.getAttribute('onclick').includes(tabName)
    );
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

/**
 * Initialise le module métadonnées
 */
function initMetadataModule() {
    // Ajouter les écouteurs d'événements si nécessaire
    const modal = document.getElementById('metadataModal');
    if (modal) {
        // Fermeture au clic en dehors du modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal('metadataModal');
            }
        });
    }
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initMetadataModule();
});

// Exporter les fonctions pour l'utilisation globale
window.showMetadata = showMetadata;
window.showMetadataTab = showMetadataTab;
