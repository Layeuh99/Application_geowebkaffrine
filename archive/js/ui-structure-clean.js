/*
 * JAVASCRIPT STRUCTUREL PROPRE - SANS TRANSFORM
 * ================================================
 * Gestion du FAB, panneaux et interactions UI
 * Animations basées sur opacity/visibility - PAS de transform
 * Stacking context maîtrisé - Z-index cohérents
 */

// ============================================
// VARIABLES GLOBALES STRUCTURELLES
// ============================================
let fabMenuOpen = false;
let leftPanelOpen = false;
let rightPanelOpen = false;

// ============================================
// FAB - GESTION SANS TRANSFORM
// ============================================
function toggleFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const fabButton = document.getElementById('fabButton');
    
    if (!fabMenu || !fabButton) {
        console.log('[FAB] Éléments non trouvés');
        return;
    }
    
    fabMenuOpen = !fabMenuOpen;
    
    if (fabMenuOpen) {
        // Ouvrir le menu - ANIMATION SANS TRANSFORM
        fabMenu.classList.add('active');
        fabButton.innerHTML = '✖️';
        console.log('[FAB] Menu ouvert');
    } else {
        // Fermer le menu - ANIMATION SANS TRANSFORM
        fabMenu.classList.remove('active');
        fabButton.innerHTML = '⚡';
        console.log('[FAB] Menu fermé');
    }
}

function closeFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const fabButton = document.getElementById('fabButton');
    
    if (!fabMenu || !fabButton) return;
    
    fabMenuOpen = false;
    fabMenu.classList.remove('active');
    fabButton.innerHTML = '⚡';
    console.log('[FAB] Menu fermé par closeFabMenu');
}

// ============================================
// PANNEAUX LATÉRAUX - GESTION SANS TRANSFORM
// ============================================
function toggleLeftPanel() {
    const leftPanel = document.getElementById('sidebarLeft');
    const toggleBtn = leftPanel?.querySelector('.panel-toggle i');
    
    if (!leftPanel) return;
    
    leftPanelOpen = !leftPanelOpen;
    
    if (leftPanelOpen) {
        leftPanel.classList.add('active');
        if (toggleBtn) toggleBtn.className = 'fas fa-chevron-left';
        console.log('[PANEL] Panneau gauche ouvert');
    } else {
        leftPanel.classList.remove('active');
        if (toggleBtn) toggleBtn.className = 'fas fa-chevron-right';
        console.log('[PANEL] Panneau gauche fermé');
    }
    
    // Invalider la taille de la carte Leaflet
    if (window.map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
}

function toggleRightPanel() {
    const rightPanel = document.getElementById('sidebarRight');
    const toggleBtn = rightPanel?.querySelector('.panel-toggle i');
    
    if (!rightPanel) return;
    
    rightPanelOpen = !rightPanelOpen;
    
    if (rightPanelOpen) {
        rightPanel.classList.add('active');
        if (toggleBtn) toggleBtn.className = 'fas fa-chevron-left';
        console.log('[PANEL] Panneau droit ouvert');
    } else {
        rightPanel.classList.remove('active');
        if (toggleBtn) toggleBtn.className = 'fas fa-chevron-right';
        console.log('[PANEL] Panneau droit fermé');
    }
    
    // Invalider la taille de la carte Leaflet
    if (window.map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
}

function closeLeftPanel() {
    const leftPanel = document.getElementById('sidebarLeft');
    const toggleBtn = leftPanel?.querySelector('.panel-toggle i');
    
    if (!leftPanel) return;
    
    leftPanelOpen = false;
    leftPanel.classList.remove('active');
    if (toggleBtn) toggleBtn.className = 'fas fa-chevron-right';
    console.log('[PANEL] Panneau gauche fermé (mobile)');
    
    if (window.map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
}

function closeRightPanel() {
    const rightPanel = document.getElementById('sidebarRight');
    const toggleBtn = rightPanel?.querySelector('.panel-toggle i');
    
    if (!rightPanel) return;
    
    rightPanelOpen = false;
    rightPanel.classList.remove('active');
    if (toggleBtn) toggleBtn.className = 'fas fa-chevron-right';
    console.log('[PANEL] Panneau droit fermé (mobile)');
    
    if (window.map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
}

// ============================================
// DROPDOWN - GESTION SANS TRANSFORM
// ============================================
function toggleDropdown(dropdownElement) {
    if (!dropdownElement) return;
    
    const isActive = dropdownElement.classList.contains('active');
    
    // Fermer tous les dropdowns
    document.querySelectorAll('.dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    
    // Ouvrir le dropdown cliqué s'il n'était pas déjà actif
    if (!isActive) {
        dropdownElement.classList.add('active');
    }
    
    console.log('[DROPDOWN] Dropdown basculé');
}

// ============================================
// MODALS - GESTION SANS TRANSFORM
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll du fond
    console.log('[MODAL] Modal ouvert:', modalId);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Rétablir le scroll
    console.log('[MODAL] Modal fermé:', modalId);
}

// ============================================
// PAGE DE BIENVENUE - CORRECTION DÉFINITIVE
// ============================================
function closeWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    if (!welcomeModal) return;
    
    welcomeModal.classList.remove('active');
    document.body.style.overflow = ''; // Rétablir le scroll
    document.body.classList.remove('welcome-open'); // Supprimer la classe bloquante
    
    // Invalider la taille de la carte Leaflet
    if (window.map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
    
    console.log('[WELCOME] Page de bienvenue fermée - Scroll rétabli');
}

// ============================================
// FONCTIONS FAB - ACTIONS RÉELLES
// ============================================
function showSpatialQuery() {
    console.log('[FAB] Recherche spatiale demandée');
    if (typeof showSpatialQueryModal === 'function') {
        showSpatialQueryModal();
    } else {
        alert('Recherche spatiale : Utilisez les outils de la carte pour analyser les données géographiques');
    }
    closeFabMenu();
}

function enableRoutingMode() {
    console.log('[FAB] Mode itinéraire activé');
    if (typeof enableRouting === 'function') {
        enableRouting();
    } else {
        alert('Mode itinéraire : Cliquez sur la carte pour définir le point de départ et d\'arrivée');
    }
    closeFabMenu();
}

function showAttributeQuery() {
    console.log('[FAB] Recherche d\'attributs demandée');
    if (typeof openModal === 'function') {
        openModal('attributeQueryModal');
    } else {
        alert('Recherche d\'attributs : Utilisez le panneau de recherche pour filtrer les données');
    }
    closeFabMenu();
}

function toggleMeasure() {
    console.log('[FAB] Outil de mesure activé');
    if (typeof toggleMeasureTool === 'function') {
        toggleMeasureTool();
    } else {
        alert('Mesure : Utilisez l\'outil de mesure de la carte (icône règle)');
    }
    closeFabMenu();
}

function showMiniTutorial() {
    console.log('[FAB] Mini tutoriel demandé');
    if (typeof showTutorial === 'function') {
        showTutorial();
    } else {
        alert('Tutoriel : Bienvenue sur GéoWeb Kaffrine !\n\nExplorez les données géographiques avec les panneaux latéraux et les outils d\'analyse.');
    }
    closeFabMenu();
}

// ============================================
// GESTION DES ÉVÉNEMENTS - SANS CONFLITS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[UI] Initialisation structurelle...');
    
    // Gestion des dropdowns
    document.addEventListener('click', function(event) {
        const dropdownToggle = event.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            event.preventDefault();
            const dropdown = dropdownToggle.closest('.dropdown');
            toggleDropdown(dropdown);
            return;
        }
        
        // Fermer les dropdowns si clic ailleurs
        if (!event.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // Gestion du clic pour fermer le FAB
    document.addEventListener('click', function(event) {
        const fabButton = document.getElementById('fabButton');
        const fabMenu = document.getElementById('fabMenu');
        
        // Si clic sur le bouton FAB, ne rien faire (géré par onclick)
        if (fabButton && (fabButton.contains(event.target) || event.target === fabButton)) {
            return;
        }
        
        // Si clic sur le menu FAB, ne rien faire
        if (fabMenu && fabMenu.contains(event.target)) {
            return;
        }
        
        // Si clic ailleurs et menu FAB ouvert, le fermer
        if (fabMenuOpen) {
            closeFabMenu();
        }
    });
    
    // Gestion des modals - fermer au clic sur l'overlay
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            closeModal(modalId);
        }
        
        if (event.target.classList.contains('welcome-modal')) {
            closeWelcomeModal();
        }
    });
    
    // Gestion du clavier - ESC pour fermer
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Fermer le FAB
            if (fabMenuOpen) {
                closeFabMenu();
            }
            
            // Fermer les modals
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
            
            // Fermer la page de bienvenue
            const welcomeModal = document.getElementById('welcomeModal');
            if (welcomeModal && welcomeModal.classList.contains('active')) {
                closeWelcomeModal();
            }
            
            // Fermer les panneaux sur mobile
            if (window.innerWidth <= 768) {
                if (leftPanelOpen) closeLeftPanel();
                if (rightPanelOpen) closeRightPanel();
            }
        }
    });
    
    // Gestion du redimensionnement - adaptation mobile
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Sur desktop, s'assurer que les panneaux sont dans le bon état
            const leftPanel = document.getElementById('sidebarLeft');
            const rightPanel = document.getElementById('sidebarRight');
            
            if (leftPanel && !leftPanelOpen) {
                leftPanel.classList.remove('active');
            }
            if (rightPanel && !rightPanelOpen) {
                rightPanel.classList.remove('active');
            }
        }
    });
    
    console.log('[UI] Structure initialisée avec succès');
});

// ============================================
// FONCTIONS DE COMPATIBILITÉ
// ============================================
// Assurer la compatibilité avec les fonctions existantes
window.toggleLeftPanel = toggleLeftPanel;
window.toggleRightPanel = toggleRightPanel;
window.closeLeftPanel = closeLeftPanel;
window.closeRightPanel = closeRightPanel;
window.toggleFabMenu = toggleFabMenu;
window.closeFabMenu = closeFabMenu;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeWelcomeModal = closeWelcomeModal;

// ============================================
// FIN - ARCHITECTURE UI STABLE ET GARANTIE
// ============================================
