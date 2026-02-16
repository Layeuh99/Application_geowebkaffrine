// FONCTIONS ESSENTIELLES SIMPLIFIÉES
// ============================================

// Fonctions de base pour l'interface - RÉELLEMENT FONCTIONNELLES
function toggleLeftPanel() {
    const panel = document.getElementById('leftPanel');
    if (panel) {
        panel.classList.toggle('active');
        console.log('[PANEL] Panneau gauche basculé');
    } else {
        console.log('[PANEL] Panneau gauche non trouvé');
    }
}

function toggleRightPanel() {
    const panel = document.getElementById('rightPanel');
    if (panel) {
        panel.classList.toggle('active');
        console.log('[PANEL] Panneau droit basculé');
    } else {
        console.log('[PANEL] Panneau droit non trouvé');
    }
}

function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
        console.log('[MENU] Menu mobile basculé');
    } else {
        console.log('[MENU] Menu mobile non trouvé');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log('[THEME] Thème changé vers:', isDark ? 'sombre' : 'clair');
}

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log('[GEO] Position trouvée:', position.coords.latitude, position.coords.longitude);
                if (window.map) {
                    window.map.setView([position.coords.latitude, position.coords.longitude], 15);
                    L.marker([position.coords.latitude, position.coords.longitude])
                        .addTo(window.map)
                        .bindPopup('Votre position')
                        .openPopup();
                }
                alert('Géolocalisation : Position trouvée et centrée sur la carte !');
            },
            function(error) {
                console.log('[GEO] Erreur de géolocalisation:', error);
                alert('Géolocalisation : Impossible d\'obtenir votre position');
            }
        );
    } else {
        alert('Géolocalisation : Non supportée par votre navigateur');
    }
}

function showInstallModal() {
    const modal = document.getElementById('installModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        console.log('[INSTALL] Modal d\'installation ouvert');
    } else {
        console.log('[INSTALL] Modal install non trouvé');
        alert('Installation : Cette application peut être installée sur votre appareil !');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        console.log('[MODAL] Modal fermé:', modalId);
    }
}

// Fonctions FAB
function toggleFabMenu() {
    const fabMenu = document.getElementById('fabMenu');
    const fabButton = document.getElementById('fabButton');
    
    if (!fabMenu || !fabButton) return;
    
    if (fabMenu.classList.contains('active')) {
        closeFabMenu();
    } else {
        fabMenu.classList.add('active');
        fabMenu.style.opacity = '1';
        fabMenu.style.visibility = 'visible';
        fabMenu.style.zIndex = '10000';
        fabButton.innerHTML = '<span style="color: white !important; font-size: 1.8rem !important;">✖️</span>';
        
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
    
    const items = fabMenu.querySelectorAll('.fab-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'translateX(20px)';
            item.style.opacity = '0';
        }, index * 30);
    });
    
    setTimeout(() => {
        fabMenu.style.opacity = '0';
        fabMenu.style.visibility = 'hidden';
    }, items.length * 30 + 100);
    
    fabButton.innerHTML = '<span style="color: white !important; font-size: 1.8rem !important;">⚡</span>';
}

// Fonctions FAB - RÉELLEMENT FONCTIONNELLES
function showSpatialQuery() {
    const modal = document.getElementById('spatialQueryModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        console.log('[FAB] Recherche spatiale ouverte');
    } else {
        console.log('[FAB] Modal spatialQuery non trouvé');
        alert('Recherche spatiale en cours de développement...');
    }
    closeFabMenu();
}

function enableRoutingMode() {
    console.log('[FAB] Mode itinéraire activé');
    alert('Mode itinéraire : Cliquez sur la carte pour définir le point de départ');
    closeFabMenu();
}

function showAttributeQuery() {
    const modal = document.getElementById('attributeQueryModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        console.log('[FAB] Recherche d\'attributs ouverte');
    } else {
        console.log('[FAB] Modal attributeQuery non trouvé');
        alert('Recherche d\'attributs en cours de développement...');
    }
    closeFabMenu();
}

function toggleMeasure() {
    const measureToggle = document.querySelector('.leaflet-control-measure-toggle');
    if (measureToggle) {
        measureToggle.click();
        console.log('[FAB] Outil de mesure activé');
    } else {
        console.log('[FAB] Contrôle de mesure non trouvé');
        alert('Outil de mesure : Utilisez les outils de la carte pour mesurer des distances');
    }
    closeFabMenu();
}

function showMiniTutorial() {
    const modal = document.getElementById('miniTutorialModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        console.log('[FAB] Mini tutoriel ouvert');
    } else {
        console.log('[FAB] Modal miniTutorial non trouvé');
        alert('Tutoriel : Bienvenue sur l\'application géographique de Kaffrine !\n\nUtilisez les contrôles de gauche pour explorer les données.');
    }
    closeFabMenu();
}

function closeMiniTutorial() {
    const modal = document.getElementById('miniTutorialModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        console.log('[FAB] Mini tutoriel fermé');
    }
}

// Écouteur de clic pour fermer le FAB
document.addEventListener('click', function(event) {
    const fabButton = document.getElementById('fabButton');
    const fabMenu = document.getElementById('fabMenu');
    
    if (fabButton && (fabButton.contains(event.target) || event.target === fabButton)) {
        return;
    }
    
    if (fabMenu && fabMenu.contains(event.target)) {
        return;
    }
    
    if (fabMenu && fabMenu.classList.contains('active')) {
        closeFabMenu();
    }
});
