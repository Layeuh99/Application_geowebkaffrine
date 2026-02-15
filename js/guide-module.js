/**
 * Module Guide Interactif - GéoWeb Kaffrine
 * Guide d'utilisation pour les non-spécialistes
 */

// ============================================
// VARIABLES GLOBALES
// ============================================
let guideOverlay = null;
let currentStep = 0;
let guideSteps = [];
let isGuideActive = false;

// ============================================
// CONFIGURATION DU GUIDE
// ============================================

const GUIDE_CONFIG = {
    steps: [
        {
            id: 'welcome',
            title: 'Bienvenue sur GéoWeb Kaffrine !',
            content: 'Ce guide va vous aider à découvrir les fonctionnalités principales de l\'application.',
            position: 'center',
            target: null,
            action: null
        },
        {
            id: 'layers',
            title: 'Gestion des couches',
            content: 'Cliquez ici pour afficher ou masquer les différentes couches de données géographiques.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(2)',
            action: 'click'
        },
        {
            id: 'basemap',
            title: 'Fonds de carte',
            content: 'Changez le fond de carte (OpenStreetMap, Google, CartoDB) pour mieux visualiser les données.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(3)',
            action: 'click'
        },
        {
            id: 'metadata',
            title: 'Métadonnées',
            content: 'Consultez les informations sur les sources de données, les dates de production et les limites d\'utilisation.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(4)',
            action: 'click'
        },
        {
            id: 'spatial',
            title: 'Analyse spatiale',
            content: 'Analysez les données autour d\'un point précis avec des buffers et des recherches par proximité.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(6)',
            action: 'click'
        },
        {
            id: 'attribute',
            title: 'Recherche d\'informations',
            content: 'Recherchez des informations spécifiques dans les données en utilisant des filtres.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(7)',
            action: 'click'
        },
        {
            id: 'routing',
            title: 'Calcul d\'itinéraire',
            content: 'Calculez des itinéraires entre deux points avec distance et temps estimé.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(8)',
            action: 'click'
        },
        {
            id: 'download',
            title: 'Téléchargement',
            content: 'Téléchargez les données dans différents formats (GeoJSON, Shapefile, KML).',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(9)',
            action: 'hover'
        },
        {
            id: 'measure',
            title: 'Outils de mesure',
            content: 'Mesurez les distances et les surfaces directement sur la carte.',
            position: 'bottom',
            target: '.navbar-menu li:nth-child(10)',
            action: 'click'
        },
        {
            id: 'zoom',
            title: 'Contrôles de zoom',
            content: 'Utilisez ces contrôles pour zoomer et dézoomer sur la carte.',
            position: 'left',
            target: '.leaflet-control-zoom',
            action: null
        },
        {
            id: 'coordinates',
            title: 'Informations de position',
            content: 'Les coordonnées, l\'échelle et le niveau de zoom s\'affichent ici en temps réel.',
            position: 'top',
            target: '.status-bar',
            action: null
        },
        {
            id: 'conclusion',
            title: 'Guide terminé !',
            content: 'Vous connaissez maintenant les bases de GéoWeb Kaffrine. N\'hésitez pas à explorer toutes les fonctionnalités !',
            position: 'center',
            target: null,
            action: null
        }
    ],
    storageKey: 'geoweb_kaffrine_guide_completed',
    showOnFirstVisit: true
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Démarre le guide interactif
 * @param {boolean} force - Force l'affichage même si déjà complété
 */
function startInteractiveGuide(force = false) {
    // Vérifier si le guide a déjà été complété
    if (!force && localStorage.getItem(GUIDE_CONFIG.storageKey)) {
        return false;
    }
    
    isGuideActive = true;
    currentStep = 0;
    guideSteps = [...GUIDE_CONFIG.steps];
    
    // Créer l'overlay du guide
    createGuideOverlay();
    
    // Afficher la première étape
    showGuideStep(0);
    
    return true;
}

/**
 * Arrête le guide interactif
 */
function stopInteractiveGuide() {
    isGuideActive = false;
    currentStep = 0;
    
    // Supprimer l'overlay
    if (guideOverlay) {
        guideOverlay.remove();
        guideOverlay = null;
    }
    
    // Marquer comme complété si demandé
    localStorage.setItem(GUIDE_CONFIG.storageKey, 'true');
}

/**
 * Crée l'overlay du guide
 */
function createGuideOverlay() {
    // Supprimer l'overlay existant
    if (guideOverlay) {
        guideOverlay.remove();
    }
    
    guideOverlay = document.createElement('div');
    guideOverlay.id = 'guideOverlay';
    guideOverlay.className = 'guide-overlay';
    guideOverlay.innerHTML = `
        <div class="guide-highlight"></div>
        <div class="guide-tooltip" id="guideTooltip">
            <div class="guide-tooltip-header">
                <h3 id="guideTitle"></h3>
                <button onclick="stopInteractiveGuide()" class="guide-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="guide-tooltip-content">
                <p id="guideContent"></p>
            </div>
            <div class="guide-tooltip-footer">
                <div class="guide-progress">
                    <span id="guideProgress">1 / ${guideSteps.length}</span>
                </div>
                <div class="guide-buttons">
                    <button onclick="previousGuideStep()" id="guidePrevBtn" class="guide-btn guide-btn-secondary" style="display: none;">
                        <i class="fas fa-chevron-left"></i> Précédent
                    </button>
                    <button onclick="nextGuideStep()" id="guideNextBtn" class="guide-btn guide-btn-primary">
                        Suivant <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(guideOverlay);
    
    // Ajouter les styles
    addGuideStyles();
}

/**
 * Affiche une étape spécifique du guide
 * @param {number} stepIndex - Index de l'étape à afficher
 */
function showGuideStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= guideSteps.length) {
        return;
    }
    
    const step = guideSteps[stepIndex];
    currentStep = stepIndex;
    
    // Mettre à jour le contenu
    document.getElementById('guideTitle').textContent = step.title;
    document.getElementById('guideContent').textContent = step.content;
    document.getElementById('guideProgress').textContent = `${stepIndex + 1} / ${guideSteps.length}`;
    
    // Mettre à jour les boutons
    const prevBtn = document.getElementById('guidePrevBtn');
    const nextBtn = document.getElementById('guideNextBtn');
    
    prevBtn.style.display = stepIndex > 0 ? 'block' : 'none';
    
    if (stepIndex === guideSteps.length - 1) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Terminer';
        nextBtn.onclick = () => {
            stopInteractiveGuide();
            showNotification('Guide terminé ! Vous pouvez le relancer depuis le menu "Accueil".', 'success');
        };
    } else {
        nextBtn.innerHTML = 'Suivant <i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => nextGuideStep();
    }
    
    // Positionner le tooltip
    positionGuideTooltip(step);
    
    // Exécuter l'action si nécessaire
    if (step.action && step.target) {
        executeGuideAction(step.action, step.target);
    }
}

/**
 * Positionne le tooltip du guide
 * @param {Object} step - Étape actuelle
 */
function positionGuideTooltip(step) {
    const tooltip = document.getElementById('guideTooltip');
    const highlight = document.querySelector('.guide-highlight');
    
    if (step.target) {
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            
            // Mettre en surbrillance la cible
            highlight.style.display = 'block';
            highlight.style.left = rect.left + 'px';
            highlight.style.top = rect.top + 'px';
            highlight.style.width = rect.width + 'px';
            highlight.style.height = rect.height + 'px';
            
            // Positionner le tooltip
            tooltip.style.position = 'fixed';
            
            switch (step.position) {
                case 'top':
                    tooltip.style.left = (rect.left + rect.width / 2 - 150) + 'px';
                    tooltip.style.top = (rect.top - 200) + 'px';
                    break;
                case 'bottom':
                    tooltip.style.left = (rect.left + rect.width / 2 - 150) + 'px';
                    tooltip.style.top = (rect.bottom + 20) + 'px';
                    break;
                case 'left':
                    tooltip.style.left = (rect.left - 320) + 'px';
                    tooltip.style.top = (rect.top + rect.height / 2 - 75) + 'px';
                    break;
                case 'right':
                    tooltip.style.left = (rect.right + 20) + 'px';
                    tooltip.style.top = (rect.top + rect.height / 2 - 75) + 'px';
                    break;
                default: // center
                    tooltip.style.left = '50%';
                    tooltip.style.top = '50%';
                    tooltip.style.transform = 'translate(-50%, -50%)';
                    highlight.style.display = 'none';
            }
        }
    } else {
        // Position centrale
        tooltip.style.position = 'fixed';
        tooltip.style.left = '50%';
        tooltip.style.top = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        highlight.style.display = 'none';
    }
}

/**
 * Exécute une action du guide
 * @param {string} action - Type d'action
 * @param {string} target - Sélecteur CSS de la cible
 */
function executeGuideAction(action, target) {
    const element = document.querySelector(target);
    if (!element) return;
    
    switch (action) {
        case 'click':
            element.click();
            break;
        case 'hover':
            element.dispatchEvent(new Event('mouseenter'));
            setTimeout(() => {
                element.dispatchEvent(new Event('mouseleave'));
            }, 2000);
            break;
    }
}

/**
 * Passe à l'étape suivante du guide
 */
function nextGuideStep() {
    if (currentStep < guideSteps.length - 1) {
        showGuideStep(currentStep + 1);
    }
}

/**
 * Passe à l'étape précédente du guide
 */
function previousGuideStep() {
    if (currentStep > 0) {
        showGuideStep(currentStep - 1);
    }
}

/**
 * Réinitialise le guide
 */
function resetGuide() {
    localStorage.removeItem(GUIDE_CONFIG.storageKey);
    showNotification('Guide réinitialisé. Il sera affiché au prochain chargement.', 'info');
}

// ============================================
// STYLES CSS
// ============================================

/**
 * Ajoute les styles CSS pour le guide
 */
function addGuideStyles() {
    if (document.getElementById('guideStyles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'guideStyles';
    style.textContent = `
        .guide-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            pointer-events: none;
        }
        
        .guide-highlight {
            position: absolute;
            background: rgba(102, 126, 234, 0.3);
            border: 3px solid #667eea;
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
            pointer-events: none;
            transition: all 0.3s ease;
        }
        
        .guide-tooltip {
            position: absolute;
            width: 300px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
            animation: guideTooltipSlide 0.3s ease-out;
        }
        
        .guide-tooltip-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 20px 0 20px;
        }
        
        .guide-tooltip-header h3 {
            margin: 0;
            color: #667eea;
            font-size: 1.2rem;
        }
        
        .guide-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #666;
            padding: 5px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .guide-close:hover {
            background: #f0f0f0;
        }
        
        .guide-tooltip-content {
            padding: 15px 20px;
        }
        
        .guide-tooltip-content p {
            margin: 0;
            color: #333;
            line-height: 1.5;
        }
        
        .guide-tooltip-footer {
            padding: 0 20px 20px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .guide-progress {
            color: #666;
            font-size: 0.9rem;
        }
        
        .guide-buttons {
            display: flex;
            gap: 10px;
        }
        
        .guide-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .guide-btn-primary {
            background: #667eea;
            color: white;
        }
        
        .guide-btn-primary:hover {
            background: #5a6fd8;
        }
        
        .guide-btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .guide-btn-secondary:hover {
            background: #5a6268;
        }
        
        @keyframes guideTooltipSlide {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .guide-tooltip {
                width: 280px;
                margin: 20px;
            }
            
            .guide-tooltip-header h3 {
                font-size: 1rem;
            }
            
            .guide-buttons {
                flex-direction: column;
                gap: 5px;
            }
            
            .guide-btn {
                width: 100%;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// INITIALISATION AUTOMATIQUE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Démarrer le guide si c'est la première visite
    if (GUIDE_CONFIG.showOnFirstVisit && !localStorage.getItem(GUIDE_CONFIG.storageKey)) {
        // Attendre un peu que la page soit chargée
        setTimeout(() => {
            startInteractiveGuide();
        }, 2000);
    }
});

// ============================================
// EXPORT DES FONCTIONS
// ============================================

window.startInteractiveGuide = startInteractiveGuide;
window.stopInteractiveGuide = stopInteractiveGuide;
window.resetGuide = resetGuide;
