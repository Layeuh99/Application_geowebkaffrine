// FONCTIONS ESSENTIELLES SIMPLIFIÉES
// ============================================

// Fonctions de base pour l'interface
function toggleLeftPanel() {
    const panel = document.getElementById('leftPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function toggleRightPanel() {
    const panel = document.getElementById('rightPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function showInstallModal() {
    const modal = document.getElementById('installModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
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
        fabButton.innerHTML = '<i class="fas fa-times" style="color: white !important; font-size: 1.4rem !important;"></i>';
        
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
    
    fabButton.innerHTML = '<i class="fas fa-bolt" style="color: white !important; font-size: 1.4rem !important;"></i>';
}

// Fonctions du FAB
function showSpatialQuery() {
    console.log('Recherche spatiale');
    closeFabMenu();
}

function enableRoutingMode() {
    console.log('Mode itinéraire');
    closeFabMenu();
}

function showAttributeQuery() {
    console.log('Recherche d\'attributs');
    closeFabMenu();
}

function toggleMeasure() {
    console.log('Mesure');
    closeFabMenu();
}

function showMiniTutorial() {
    console.log('Mini tutoriel');
    closeFabMenu();
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
