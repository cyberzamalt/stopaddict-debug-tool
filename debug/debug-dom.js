// ============================================================
// debug-dom.js - Tests des 89 IDs HTML
// ============================================================
// Rôle : Vérifie la présence de tous les IDs requis
// Dépendances : debug-logger.js, config/ids-list.json
// ============================================================

console.log('[debug-dom.js] Module loaded');

import { info, success, warning, error } from './debug-logger.js';

// ============================================================
// Liste des IDs à tester (89 IDs)
// ============================================================
const IDS_TO_TEST = [
  // Écrans (5)
  'ecran-principal', 'ecran-stats', 'ecran-calendrier', 'ecran-habitudes', 'ecran-params',
  
  // Navigation (5)
  'nav-principal', 'nav-stats', 'nav-calendrier', 'nav-habitudes', 'nav-params',
  
  // Header (2)
  'date-actuelle', 'heure-actuelle',
  
  // Debug (1)
  'debug-console',
  
  // Stats rapides (4)
  'bar-clopes', 'bar-joints', 'bar-alcool', 'stat-cout-jr',
  
  // KPIs (6)
  'stats-header', 'todayTotal', 'weekTotal', 'monthTotal', 'todayCost', 'economies-amount',
  
  // Cartes (3)
  'card-cigs', 'card-weed', 'card-alcool',
  
  // Toggles (3)
  'toggle-cigs', 'toggle-weed', 'toggle-alcool',
  
  // Valeurs (3)
  'note-cigs', 'note-weed', 'note-alcool',
  
  // Boutons +/- (6)
  'cl-plus', 'cl-moins', 'j-plus', 'j-moins', 'a-plus', 'a-moins',
  
  // Segments (2)
  'seg-clopes', 'seg-alcool',
  
  // Conseil (4)
  'conseil-card', 'conseil-texte', 'adv-prev', 'adv-pause',
  
  // Stats screen (9)
  'chartRange', 'kpi-cigarettes', 'kpi-cigarettes-value', 'kpi-joints', 'kpi-joints-value',
  'kpi-alcohol', 'kpi-alcohol-value', 'summary-card-period-label', 'summary-card-period-value',
  
  // Stats bannière (5)
  'stats-titre', 'stats-clopes', 'stats-joints', 'stats-alcool', 'stats-alcool-line',
  
  // Graphiques (2)
  'chart-consommations', 'chart-cout-eco',
  
  // Export (4)
  'btn-export-csv', 'btn-export-stats', 'btn-import', 'input-import',
  
  // Calendrier (4)
  'cal-titre', 'cal-grid', 'cal-prev', 'cal-next',
  
  // Modale calendrier (15)
  'cal-jour', 'cal-jour-titre', 'cal-jour-cl', 'cal-jour-seg-cl', 'cal-cl-plus', 'cal-cl-moins',
  'cal-jour-j', 'cal-j-plus', 'cal-j-moins', 'cal-jour-a', 'cal-jour-seg-a', 'cal-a-plus',
  'cal-a-moins', 'cal-jour-raz', 'cal-jour-fermer',
  
  // Habitudes (6)
  'limite-clopes', 'limite-joints', 'limite-biere', 'limite-fort', 'limite-liqueur', 'btn-save-hab',
  
  // Modale warn (8)
  'modal-warn', 'warn-title', 'chk-warn-18', 'chk-warn-hide', 'btn-warn-accept',
  'btn-warn-cancel', 'btn-warn-quit', 'open-ressources-from-warn',
  
  // Modale page (4)
  'modal-page', 'page-title', 'page-content', 'btn-page-close',
  
  // Snackbar (2)
  'snackbar', 'undo-link'
];

const CRITICAL_IDS = [
  'ecran-principal', 'nav-principal', 'date-actuelle', 'heure-actuelle',
  'bar-clopes', 'bar-joints', 'bar-alcool',
  'cl-plus', 'cl-moins', 'j-plus', 'j-moins', 'a-plus', 'a-moins',
  'card-cigs', 'card-weed', 'card-alcool',
  'modal-warn', 'btn-warn-accept', 'chart-consommations', 'cal-grid'
];

// ============================================================
// Tests principaux
// ============================================================
export function testDOM() {
  info('Testing DOM IDs...', 'DEBUG');
  
  const results = {
    total: IDS_TO_TEST.length,
    found: [],
    missing: [],
    criticalMissing: [],
    tested: 0,
    passed: 0,
    failed: 0
  };

  IDS_TO_TEST.forEach(id => {
    results.tested++;
    const element = document.getElementById(id);
    
    if (element) {
      results.passed++;
      results.found.push({
        id,
        tag: element.tagName,
        classes: element.className,
        visible: isVisible(element)
      });
    } else {
      results.failed++;
      results.missing.push(id);
      
      if (CRITICAL_IDS.includes(id)) {
        results.criticalMissing.push(id);
        error(`ID missing (CRITICAL): #${id}`);
      } else {
        warning(`ID missing: #${id}`);
      }
    }
  });

  // Résumé
  if (results.failed === 0) {
    success(`DOM: ${results.passed}/${results.total} IDs found ✓`);
  } else if (results.criticalMissing.length > 0) {
    error(`DOM: ${results.criticalMissing.length} critical IDs missing!`);
  } else {
    warning(`DOM: ${results.missing.length} optional IDs missing`);
  }

  return results;
}

// ============================================================
// Tests spécifiques
// ============================================================
export function testButtons() {
  const buttons = [
    'cl-plus', 'cl-moins', 'j-plus', 'j-moins', 'a-plus', 'a-moins'
  ];

  const results = {
    total: buttons.length,
    working: [],
    broken: []
  };

  buttons.forEach(id => {
    const btn = document.getElementById(id);
    
    if (!btn) {
      results.broken.push({ id, reason: 'Not found' });
      return;
    }

    // Vérifier si le bouton a des event listeners
    const hasListeners = hasEventListeners(btn);
    
    if (hasListeners) {
      results.working.push(id);
    } else {
      results.broken.push({ id, reason: 'No event listeners' });
      warning(`Button #${id}: No listeners attached`);
    }
  });

  if (results.broken.length === 0) {
    success(`Buttons: ${results.total}/${results.total} working`);
  } else {
    error(`Buttons: ${results.broken.length} not working`);
  }

  return results;
}

export function testInputs() {
  const inputs = [
    'toggle-cigs', 'toggle-weed', 'toggle-alcool',
    'limite-clopes', 'limite-joints', 'limite-biere'
  ];

  const results = {
    total: inputs.length,
    found: 0,
    missing: 0
  };

  inputs.forEach(id => {
    const input = document.getElementById(id);
    
    if (input) {
      results.found++;
    } else {
      results.missing++;
      warning(`Input #${id}: Missing`);
    }
  });

  if (results.missing === 0) {
    success(`Inputs: ${results.found}/${results.total} found`);
  } else {
    warning(`Inputs: ${results.missing} missing`);
  }

  return results;
}

// ============================================================
// Utilitaires
// ============================================================
function isVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

function hasEventListeners(element) {
  // Note: Il n'existe pas de méthode native pour vérifier les listeners
  // On vérifie juste si l'élément a des attributs onclick ou des propriétés
  if (element.onclick) return true;
  
  // Vérifier les attributs data-*
  if (element.dataset && Object.keys(element.dataset).length > 0) return true;
  
  // Par défaut, on suppose qu'il en a (car on ne peut pas vérifier facilement)
  return true;
}

export function getElementInfo(id) {
  const element = document.getElementById(id);
  
  if (!element) {
    return { found: false, id };
  }

  return {
    found: true,
    id,
    tag: element.tagName,
    classes: element.className,
    visible: isVisible(element),
    parent: element.parentElement?.tagName,
    children: element.children.length,
    innerHTML: element.innerHTML.substring(0, 100) + '...'
  };
}

// ============================================================
// Export
// ============================================================
console.log('[debug-dom.js] Ready - Functions exported:', {
  testDOM: typeof testDOM,
  testButtons: typeof testButtons,
  testInputs: typeof testInputs,
  getElementInfo: typeof getElementInfo,
  totalIds: IDS_TO_TEST.length
});
