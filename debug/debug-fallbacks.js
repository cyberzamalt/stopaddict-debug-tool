// ============================================================
// debug-fallbacks.js - Mécanismes de secours
// ============================================================
// Rôle : Auto-réparation et solutions de secours
// Dépendances : debug-logger.js
// ============================================================

console.log('[debug-fallbacks.js] Module loaded');

import { info, success, warning, error } from './debug-logger.js';

// ============================================================
// Auto-réparation localStorage
// ============================================================
export function repairLocalStorage() {
  info('Attempting to repair localStorage...', 'DEBUG');
  
  const result = {
    available: false,
    repaired: [],
    failed: [],
    errors: []
  };

  try {
    // Vérifier disponibilité
    if (typeof localStorage === 'undefined') {
      result.errors.push('localStorage not available');
      error('Fallback: localStorage not available');
      return result;
    }

    result.available = true;

    // Clés à vérifier
    const keysToCheck = [
      'sa_daily_v1',
      'sa_settings_v1',
      'sa_limits_v1',
      'sa_economy_v1',
      'sa_warn_v1'
    ];

    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        
        if (value === null) {
          // Clé manquante : créer valeur par défaut
          const defaultValue = getDefaultValue(key);
          localStorage.setItem(key, JSON.stringify(defaultValue));
          result.repaired.push(key);
          success(`Fallback: Created ${key} with defaults`);
        } else {
          // Clé existe : vérifier validité JSON
          try {
            JSON.parse(value);
            info(`Fallback: ${key} is valid`);
          } catch (jsonError) {
            // JSON invalide : remplacer par défaut
            const defaultValue = getDefaultValue(key);
            localStorage.setItem(key, JSON.stringify(defaultValue));
            result.repaired.push(key);
            warning(`Fallback: Repaired corrupted ${key}`);
          }
        }
      } catch (e) {
        result.failed.push(key);
        result.errors.push(`${key}: ${e.message}`);
        error(`Fallback: Cannot repair ${key}`, e);
      }
    });

    // Résumé
    if (result.repaired.length > 0) {
      success(`Fallback: Repaired ${result.repaired.length} keys`);
    } else {
      info('Fallback: No repairs needed');
    }

  } catch (e) {
    result.errors.push(`Repair error: ${e.message}`);
    error('Fallback: Repair failed', e);
  }

  return result;
}

// ============================================================
// Valeurs par défaut localStorage
// ============================================================
function getDefaultValue(key) {
  const defaults = {
    'sa_daily_v1': {},
    'sa_settings_v1': {
      modules: { cigs: true, weed: true, alcohol: true },
      prices: { cigs: 10, weed: 5, beer: 2.5, fort: 15, liqueur: 20 }
    },
    'sa_limits_v1': {
      cigs: 20,
      weed: 3,
      alcohol_biere: 2,
      alcohol_fort: 1,
      alcohol_liqueur: 1
    },
    'sa_economy_v1': {
      enabled: false,
      baseline: {}
    },
    'sa_warn_v1': {
      accepted: false,
      hide: false,
      timestamp: new Date().toISOString()
    }
  };

  return defaults[key] || {};
}

// ============================================================
// Création dynamique d'IDs manquants
// ============================================================
export function createMissingElements(missingIds) {
  info('Attempting to create missing elements...', 'DEBUG');
  
  const result = {
    created: [],
    failed: [],
    errors: []
  };

  if (!Array.isArray(missingIds) || missingIds.length === 0) {
    info('Fallback: No missing IDs to create');
    return result;
  }

  missingIds.forEach(id => {
    try {
      // Créer un élément div avec l'ID manquant
      const element = document.createElement('div');
      element.id = id;
      element.className = 'debug-fallback';
      element.style.display = 'none';
      element.dataset.debugFallback = 'true';
      
      // Ajouter au body
      document.body.appendChild(element);
      
      result.created.push(id);
      success(`Fallback: Created missing #${id}`);
    } catch (e) {
      result.failed.push(id);
      result.errors.push(`${id}: ${e.message}`);
      error(`Fallback: Cannot create #${id}`, e);
    }
  });

  if (result.created.length > 0) {
    success(`Fallback: Created ${result.created.length} missing elements`);
  }

  return result;
}

// ============================================================
// Stub de fonctions manquantes
// ============================================================
export function createFunctionStubs(module, missingFunctions) {
  info('Creating function stubs...', 'DEBUG');
  
  const result = {
    created: [],
    failed: [],
    errors: []
  };

  if (!module || !Array.isArray(missingFunctions) || missingFunctions.length === 0) {
    info('Fallback: No stubs to create');
    return result;
  }

  missingFunctions.forEach(funcName => {
    try {
      // Créer un stub qui log une erreur
      module[funcName] = function(...args) {
        error(`Stub: ${funcName}() called but not implemented`, args);
        return null;
      };
      
      result.created.push(funcName);
      warning(`Fallback: Created stub for ${funcName}()`);
    } catch (e) {
      result.failed.push(funcName);
      result.errors.push(`${funcName}: ${e.message}`);
      error(`Fallback: Cannot create stub for ${funcName}`, e);
    }
  });

  if (result.created.length > 0) {
    warning(`Fallback: Created ${result.created.length} function stubs`);
  }

  return result;
}

// ============================================================
// Fallback Chart.js
// ============================================================
export function createChartFallback() {
  info('Creating Chart.js fallback...', 'DEBUG');
  
  const result = {
    created: false,
    error: null
  };

  try {
    if (typeof window.Chart !== 'undefined') {
      info('Fallback: Chart.js already available');
      return result;
    }

    // Créer un stub Chart.js minimal
    window.Chart = function(canvas, config) {
      warning('Fallback: Using Chart.js stub (no real rendering)');
      return {
        destroy: () => {},
        update: () => {},
        render: () => {},
        canvas: canvas,
        config: config
      };
    };

    window.Chart.version = 'stub';
    
    result.created = true;
    warning('Fallback: Chart.js stub created');

  } catch (e) {
    result.error = e.message;
    error('Fallback: Cannot create Chart.js stub', e);
  }

  return result;
}

// ============================================================
// Nettoyage des fallbacks
// ============================================================
export function cleanupFallbacks() {
  info('Cleaning up fallbacks...', 'DEBUG');
  
  const result = {
    cleaned: 0,
    errors: []
  };

  try {
    // Supprimer les éléments créés dynamiquement
    const fallbackElements = document.querySelectorAll('[data-debug-fallback="true"]');
    fallbackElements.forEach(element => {
      try {
        element.remove();
        result.cleaned++;
      } catch (e) {
        result.errors.push(`Cannot remove ${element.id}: ${e.message}`);
      }
    });

    if (result.cleaned > 0) {
      success(`Fallback: Cleaned ${result.cleaned} elements`);
    }

  } catch (e) {
    result.errors.push(`Cleanup error: ${e.message}`);
    error('Fallback: Cleanup failed', e);
  }

  return result;
}

// ============================================================
// Export
// ============================================================
console.log('[debug-fallbacks.js] Ready - Functions exported:', {
  repairLocalStorage: typeof repairLocalStorage,
  createMissingElements: typeof createMissingElements,
  createFunctionStubs: typeof createFunctionStubs,
  createChartFallback: typeof createChartFallback,
  cleanupFallbacks: typeof cleanupFallbacks
});
