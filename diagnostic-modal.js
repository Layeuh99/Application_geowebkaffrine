// ============================================
// DIAGNOSTIC MODAL - Script de débogage complet
// ============================================

console.log('[DIAGNOSTIC] Démarrage du diagnostic modal...');

// Fonction de diagnostic complet
function diagnosticModal() {
    console.log('[DIAGNOSTIC] ===========================================');
    console.log('[DIAGNOSTIC] DIAGNOSTIC COMPLET DU MODAL');
    console.log('[DIAGNOSTIC] ===========================================');
    
    // 1. Vérifier l'existence du modal
    const modal = document.getElementById('welcomeModal');
    if (!modal) {
        console.error('[DIAGNOSTIC] ❌ Modal welcomeModal NON TROUVÉ');
        return;
    } else {
        console.log('[DIAGNOSTIC] ✅ Modal welcomeModal trouvé');
    }
    
    // 2. Vérifier les styles CSS appliqués
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        const computed = getComputedStyle(modalContent);
        console.log('[DIAGNOSTIC] 📊 Styles CSS du modal-content:');
        console.log(`  - max-height: ${computed.maxHeight}`);
        console.log(`  - overflow-y: ${computed.overflowY}`);
        console.log(`  - overflow-x: ${computed.overflowX}`);
        console.log(`  - touch-action: ${computed.touchAction}`);
        console.log(`  - -webkit-overflow-scrolling: ${computed.webkitOverflowScrolling}`);
        console.log(`  - height: ${computed.height}`);
        console.log(`  - position: ${computed.position}`);
        console.log(`  - display: ${computed.display}`);
        
        // Vérifier si les styles corrects sont appliqués
        const hasCorrectMaxHeight = computed.maxHeight.includes('vh') && parseInt(computed.maxHeight) <= 90;
        const hasCorrectOverflow = computed.overflowY === 'auto' || computed.overflowY === 'scroll';
        const hasCorrectTouch = computed.touchAction === 'auto';
        
        console.log('[DIAGNOSTIC] 📋 Vérification des styles:');
        console.log(`  - max-height correct (≤90vh): ${hasCorrectMaxHeight ? '✅' : '❌'}`);
        console.log(`  - overflow-y correct (auto): ${hasCorrectOverflow ? '✅' : '❌'}`);
        console.log(`  - touch-action correct (auto): ${hasCorrectTouch ? '✅' : '❌'}`);
        
        if (!hasCorrectMaxHeight || !hasCorrectOverflow || !hasCorrectTouch) {
            console.error('[DIAGNOSTIC] ❌ Styles CSS incorrects détectés');
        } else {
            console.log('[DIAGNOSTIC] ✅ Styles CSS corrects');
        }
    }
    
    // 3. Vérifier le body scroll
    const bodyComputed = getComputedStyle(document.body);
    console.log('[DIAGNOSTIC] 📊 Styles CSS du body:');
    console.log(`  - overflow: ${bodyComputed.overflow}`);
    console.log(`  - overflow-x: ${bodyComputed.overflowX}`);
    console.log(`  - overflow-y: ${bodyComputed.overflowY}`);
    console.log(`  - position: ${bodyComputed.position}`);
    
    const bodyScrollOK = bodyComputed.overflow !== 'hidden' && bodyComputed.overflowY !== 'hidden';
    console.log(`  - body scroll non bloqué: ${bodyScrollOK ? '✅' : '❌'}`);
    
    // 4. Vérifier les classes CSS
    console.log('[DIAGNOSTIC] 📋 Classes CSS:');
    console.log(`  - Modal classes: ${modal.className}`);
    console.log(`  - Body classes: ${document.body.className}`);
    
    // 5. Vérifier les fonctions JavaScript
    console.log('[DIAGNOSTIC] 📋 Fonctions JavaScript:');
    console.log(`  - closeWelcomeModal existe: ${typeof closeWelcomeModal === 'function' ? '✅' : '❌'}`);
    console.log(`  - showWelcomeModal existe: ${typeof showWelcomeModal === 'function' ? '✅' : '❌'}`);
    
    // 6. Vérifier les fichiers CSS chargés
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('[DIAGNOSTIC] 📁 Fichiers CSS chargés:');
    cssLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.href}`);
    });
    
    // 7. Vérifier le viewport mobile
    console.log('[DIAGNOSTIC] 📱 Informations mobile:');
    console.log(`  - Largeur écran: ${window.innerWidth}px`);
    console.log(`  - Hauteur écran: ${window.innerHeight}px`);
    console.log(`  - User agent: ${navigator.userAgent}`);
    console.log(`  - Support touch: ${('ontouchstart' in window) ? '✅' : '❌'}`);
    
    // 8. Test de scroll
    if (modalContent) {
        const scrollHeight = modalContent.scrollHeight;
        const clientHeight = modalContent.clientHeight;
        const hasScroll = scrollHeight > clientHeight;
        
        console.log('[DIAGNOSTIC] 📜 Test de scroll:');
        console.log(`  - scrollHeight: ${scrollHeight}px`);
        console.log(`  - clientHeight: ${clientHeight}px`);
        console.log(`  - Scroll possible: ${hasScroll ? '✅' : '❌'}`);
        
        if (hasScroll) {
            // Test de scroll automatique
            console.log('[DIAGNOSTIC] 🧪 Test de scroll automatique...');
            modalContent.scrollTop = 0;
            setTimeout(() => {
                modalContent.scrollTop = 100;
                console.log('[DIAGNOSTIC] ✅ Scroll testé - scrollTop:', modalContent.scrollTop);
            }, 1000);
        }
    }
    
    console.log('[DIAGNOSTIC] ===========================================');
    console.log('[DIAGNOSTIC] FIN DU DIAGNOSTIC');
    console.log('[DIAGNOSTIC] ===========================================');
}

// Fonction pour appliquer les corrections forcées
function forcerCorrectionsModal() {
    console.log('[CORRECTION] Application forcée des corrections...');
    
    const modal = document.getElementById('welcomeModal');
    if (!modal) {
        console.error('[CORRECTION] Modal non trouvé');
        return;
    }
    
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) {
        console.error('[CORRECTION] Modal content non trouvé');
        return;
    }
    
    // Appliquer les styles CRITIQUES en inline
    modalContent.style.setProperty('max-height', '85vh', 'important');
    modalContent.style.setProperty('overflow-y', 'auto', 'important');
    modalContent.style.setProperty('overflow-x', 'hidden', 'important');
    modalContent.style.setProperty('touch-action', 'auto', 'important');
    modalContent.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
    modalContent.style.setProperty('height', 'auto', 'important');
    
    // Forcer le body scroll
    document.body.style.setProperty('overflow', 'auto', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    
    console.log('[CORRECTION] ✅ Corrections forcées appliquées');
    
    // Vérifier après application
    setTimeout(() => {
        const computed = getComputedStyle(modalContent);
        console.log('[CORRECTION] 📊 Styles après correction forcée:');
        console.log(`  - max-height: ${computed.maxHeight}`);
        console.log(`  - overflow-y: ${computed.overflowY}`);
        console.log(`  - touch-action: ${computed.touchAction}`);
    }, 100);
}

// Fonction pour tester le modal
function testModalComplet() {
    console.log('[TEST] Test complet du modal...');
    
    const modal = document.getElementById('welcomeModal');
    if (!modal) {
        console.error('[TEST] Modal non trouvé');
        return;
    }
    
    // Ouvrir le modal
    console.log('[TEST] Ouverture du modal...');
    modal.classList.add('active');
    
    // Forcer les corrections
    forcerCorrectionsModal();
    
    // Tester le scroll après 2 secondes
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            console.log('[TEST] Test de scroll...');
            modalContent.scrollTop = 0;
            setTimeout(() => {
                modalContent.scrollTop = 150;
                console.log('[TEST] Scroll effectué - scrollTop:', modalContent.scrollTop);
            }, 500);
        }
    }, 2000);
    
    // Fermer après 5 secondes
    setTimeout(() => {
        console.log('[TEST] Fermeture du modal...');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }, 5000);
}

// Démarrer le diagnostic automatiquement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(diagnosticModal, 2000);
    });
} else {
    setTimeout(diagnosticModal, 1000);
}

// Rendre les fonctions disponibles globalement
window.diagnosticModal = diagnosticModal;
window.forcerCorrectionsModal = forcerCorrectionsModal;
window.testModalComplet = testModalComplet;

console.log('[DIAGNOSTIC] Script de diagnostic chargé. Utilisez:');
console.log('[DIAGNOSTIC] - diagnosticModal() pour le diagnostic complet');
console.log('[DIAGNOSTIC] - forcerCorrectionsModal() pour appliquer les corrections');
console.log('[DIAGNOSTIC] - testModalComplet() pour tester le modal');
