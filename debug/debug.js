// ============================================================
// debug.js - ORCHESTRATEUR PRINCIPAL
// ============================================================
// Rôle : Point d'entrée unique du Debug Tool StopAddict
// Version : 1.0.0
// Auteur : StopAddict Debug Team
// ============================================================
// IMPORTANT : Ce fichier doit être chargé AVANT app.js
// Usage : <script src="./js/debug.js"></script>
// ============================================================

console.log('[debug.js] 🔍 Debug Tool StopAddict v1.0 - Initializing...');

// ============================================================
// Configuration globale
// ============================================================
const DEBUG_CONFIG = {
  version: '1.0.0',
  enabled: false,
  autoInit: true,
  storageKey: 'SA_DEBUG',
  historyKey: 'SA_DEBUG_HISTORY',
  tapCount: 5,
  tapTimeout: 800
};

// ============================================================
// État global du debug
// ============================================================
let debugState = {
  initialized: false,
  active: false,
  modules: {},
  results: {},
  errors: [],
  startTime: null
};

// ============================================================
// Imports dynamiques (modules ES6)
// ============================================================
let debugLogger = null;
let debugUI = null;
let debugModules = null;
let debugDOM = null;
let debugStorage = null;
let debugEvents = null;
let debugChart = null;
let debugFallbacks = null;

// ============================================================
// Capture des erreurs globales
// ============================================================
function setupErrorCapture() {
  console.log('[debug.js] Setting up global error capture...');

  // Capture erreurs JavaScript
  window.addEventListener('error', (event) => {
    const errorInfo = {
      type: 'ERROR',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.stack : null,
      timestamp: new Date().toISOString()
    };

    debugState.errors.push(errorInfo);
    
    console.error('[debug.js] 🔴 ERROR CAPTURED:', errorInfo);
    
    if (debugLogger) {
      debugLogger.error(`${errorInfo.message} (${errorInfo.filename}:${errorInfo.lineno})`);
    }
  });

  // Capture promesses rejetées
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = {
      type: 'UNHANDLED_REJECTION',
      message: event.reason ? event.reason.message : 'Promise rejected',
      reason: event.reason,
      timestamp: new Date().toISOString()
    };

    debugState.errors.push(errorInfo);
    
    console.error('[debug.js] 🔴 UNHANDLED REJECTION:', errorInfo);
    
    if (debugLogger) {
      debugLogger.error(`Promise rejected: ${errorInfo.message}`);
    }
  });

  console.log('[debug.js] ✅ Error capture active');
}

// ============================================================
// Chargement des modules de debug
// ============================================================
async function loadDebugModules() {
  console.log('[debug.js] Loading debug modules...');
  
  try {
    // Charger debug-logger (priorité 1)
    try {
      debugLogger = await import('./debug-logger.js');
      debugLogger.initLogger();
      debugState.modules.logger = { loaded: true, error: null };
      console.log('[debug.js] ✅ Logger loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load logger:', e);
      debugState.modules.logger = { loaded: false, error: e.message };
      return false;
    }

    // Charger debug-ui
    try {
      debugUI = await import('./debug-ui.js');
      debugState.modules.ui = { loaded: true, error: null };
      debugLogger.success('UI module loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load UI:', e);
      debugState.modules.ui = { loaded: false, error: e.message };
      debugLogger.error(`UI load failed: ${e.message}`);
    }

    // Charger debug-modules
    try {
      debugModules = await import('./debug-modules.js');
      debugState.modules.modules = { loaded: true, error: null };
      debugLogger.success('Modules tester loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load modules tester:', e);
      debugState.modules.modules = { loaded: false, error: e.message };
      debugLogger.error(`Modules tester load failed: ${e.message}`);
    }

    // Charger debug-dom
    try {
      debugDOM = await import('./debug-dom.js');
      debugState.modules.dom = { loaded: true, error: null };
      debugLogger.success('DOM tester loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load DOM tester:', e);
      debugState.modules.dom = { loaded: false, error: e.message };
      debugLogger.error(`DOM tester load failed: ${e.message}`);
    }

    // Charger debug-storage
    try {
      debugStorage = await import('./debug-storage.js');
      debugState.modules.storage = { loaded: true, error: null };
      debugLogger.success('Storage tester loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load storage tester:', e);
      debugState.modules.storage = { loaded: false, error: e.message };
      debugLogger.error(`Storage tester load failed: ${e.message}`);
    }

    // Charger debug-events
    try {
      debugEvents = await import('./debug-events.js');
      debugState.modules.events = { loaded: true, error: null };
      debugLogger.success('Events tester loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load events tester:', e);
      debugState.modules.events = { loaded: false, error: e.message };
      debugLogger.error(`Events tester load failed: ${e.message}`);
    }

    // Charger debug-chart
    try {
      debugChart = await import('./debug-chart.js');
      debugState.modules.chart = { loaded: true, error: null };
      debugLogger.success('Chart tester loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load chart tester:', e);
      debugState.modules.chart = { loaded: false, error: e.message };
      debugLogger.error(`Chart tester load failed: ${e.message}`);
    }

    // Charger debug-fallbacks
    try {
      debugFallbacks = await import('./debug-fallbacks.js');
      debugState.modules.fallbacks = { loaded: true, error: null };
      debugLogger.success('Fallbacks loaded');
    } catch (e) {
      console.error('[debug.js] ❌ Cannot load fallbacks:', e);
      debugState.modules.fallbacks = { loaded: false, error: e.message };
      debugLogger.error(`Fallbacks load failed: ${e.message}`);
    }

    console.log('[debug.js] ✅ All modules loaded');
    return true;

  } catch (e) {
    console.error('[debug.js] ❌ Fatal error loading modules:', e);
    return false;
  }
}

// ============================================================
// Exécution des tests
// ============================================================
async function runAllTests() {
  if (!debugLogger) {
    console.error('[debug.js] Cannot run tests: logger not loaded');
    return;
  }

  debugLogger.info('='.repeat(50), 'DEBUG');
  debugLogger.info('🔍 DEBUG STOPADDICT v' + DEBUG_CONFIG.version, 'DEBUG');
  debugLogger.info('Starting diagnostic tests...', 'DEBUG');
  debugLogger.info('='.repeat(50), 'DEBUG');

  const startTime = performance.now();

  // Test 1 : Modules JS
  if (debugModules) {
    try {
      debugLogger.info('--- TEST 1/6: JavaScript Modules ---', 'DEBUG');
      debugState.results.modules = await debugModules.testModules();
      debugState.results.stateModule = await debugModules.testStateModule();
      debugState.results.chartJS = debugModules.testChartJS();
    } catch (e) {
      debugLogger.error(`Modules test failed: ${e.message}`);
      debugState.results.modules = { error: e.message };
    }
  } else {
    debugLogger.warning('Modules tester not available');
  }

  // Test 2 : DOM (IDs)
  if (debugDOM) {
    try {
      debugLogger.info('--- TEST 2/6: DOM Elements (89 IDs) ---', 'DEBUG');
      debugState.results.dom = debugDOM.testDOM();
      debugState.results.buttons = debugDOM.testButtons();
      debugState.results.inputs = debugDOM.testInputs();
    } catch (e) {
      debugLogger.error(`DOM test failed: ${e.message}`);
      debugState.results.dom = { error: e.message };
    }
  } else {
    debugLogger.warning('DOM tester not available');
  }

  // Test 3 : localStorage
  if (debugStorage) {
    try {
      debugLogger.info('--- TEST 3/6: localStorage ---', 'DEBUG');
      debugState.results.storage = debugStorage.testLocalStorage();
      debugState.results.storageSize = debugStorage.getStorageSize();
    } catch (e) {
      debugLogger.error(`Storage test failed: ${e.message}`);
      debugState.results.storage = { error: e.message };
    }
  } else {
    debugLogger.warning('Storage tester not available');
  }

  // Test 4 : Events
  if (debugEvents) {
    try {
      debugLogger.info('--- TEST 4/6: Custom Events ---', 'DEBUG');
      debugState.results.events = debugEvents.testEvents();
      debugState.results.eventBus = await debugEvents.testEventBus();
    } catch (e) {
      debugLogger.error(`Events test failed: ${e.message}`);
      debugState.results.events = { error: e.message };
    }
  } else {
    debugLogger.warning('Events tester not available');
  }

  // Test 5 : Chart.js
  if (debugChart) {
    try {
      debugLogger.info('--- TEST 5/6: Chart.js & Canvases ---', 'DEBUG');
      debugState.results.chartDetailed = debugChart.testChartJS();
      debugState.results.canvases = debugChart.testChartCanvases();
    } catch (e) {
      debugLogger.error(`Chart test failed: ${e.message}`);
      debugState.results.chartDetailed = { error: e.message };
    }
  } else {
    debugLogger.warning('Chart tester not available');
  }

  // Test 6 : Fallbacks (si nécessaire)
  if (debugFallbacks) {
    try {
      debugLogger.info('--- TEST 6/6: Fallbacks & Repairs ---', 'DEBUG');
      
      // Vérifier si réparations nécessaires
      let needsRepair = false;
      
      if (debugState.results.storage && debugState.results.storage.errors.length > 0) {
        needsRepair = true;
        debugLogger.warning('localStorage issues detected, attempting repair...');
        debugState.results.storageRepair = debugFallbacks.repairLocalStorage();
      }

      if (debugState.results.dom && debugState.results.dom.missing.length > 0) {
        const criticalMissing = debugState.results.dom.criticalMissing || [];
        if (criticalMissing.length > 0) {
          needsRepair = true;
          debugLogger.warning('Critical IDs missing, attempting to create...');
          debugState.results.elementsCreated = debugFallbacks.createMissingElements(criticalMissing);
        }
      }

      if (!debugState.results.chartJS || !debugState.results.chartJS.available) {
        needsRepair = true;
        debugLogger.warning('Chart.js not available, creating fallback...');
        debugState.results.chartFallback = debugFallbacks.createChartFallback();
      }

      if (!needsRepair) {
        debugLogger.success('No repairs needed');
      }

    } catch (e) {
      debugLogger.error(`Fallbacks test failed: ${e.message}`);
      debugState.results.fallbacks = { error: e.message };
    }
  } else {
    debugLogger.warning('Fallbacks not available');
  }

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  debugLogger.info('='.repeat(50), 'DEBUG');
  debugLogger.success(`✅ All tests completed in ${duration}ms`, 'SUCCESS');
  debugLogger.info('='.repeat(50), 'DEBUG');

  // Afficher résumé
  displaySummary();
}

// ============================================================
// Affichage du résumé
// ============================================================
function displaySummary() {
  if (!debugLogger) return;

  debugLogger.info('📊 SUMMARY', 'INFO');
  debugLogger.info('─'.repeat(50), 'INFO');

  // Modules
  if (debugState.results.modules) {
    const m = debugState.results.modules;
    if (m.failed === 0) {
      debugLogger.success(`✅ Modules: ${m.passed}/${m.total} OK`);
    } else if (m.criticalFailed > 0) {
      debugLogger.error(`❌ Modules: ${m.criticalFailed} critical failures`);
    } else {
      debugLogger.warning(`⚠️  Modules: ${m.failed} failures`);
    }
  }

  // DOM
  if (debugState.results.dom) {
    const d = debugState.results.dom;
    if (d.failed === 0) {
      debugLogger.success(`✅ DOM: ${d.passed}/${d.total} IDs found`);
    } else if (d.criticalMissing && d.criticalMissing.length > 0) {
      debugLogger.error(`❌ DOM: ${d.criticalMissing.length} critical IDs missing`);
    } else {
      debugLogger.warning(`⚠️  DOM: ${d.missing.length} IDs missing`);
    }
  }

  // localStorage
  if (debugState.results.storage) {
    const s = debugState.results.storage;
    if (s.failed === 0) {
      debugLogger.success(`✅ Storage: ${s.passed}/${s.tested} keys OK`);
    } else if (s.errors.length > 0) {
      debugLogger.error(`❌ Storage: ${s.errors.length} critical errors`);
    } else {
      debugLogger.warning(`⚠️  Storage: ${s.warnings.length} warnings`);
    }
  }

  // Chart.js
  if (debugState.results.chartJS) {
    const c = debugState.results.chartJS;
    if (c.available) {
      debugLogger.success(`✅ Chart.js: Available (v${c.version})`);
    } else {
      debugLogger.error(`❌ Chart.js: Not available`);
    }
  }

  // Erreurs globales
  if (debugState.errors.length > 0) {
    debugLogger.error(`❌ ${debugState.errors.length} JavaScript errors captured`);
  } else {
    debugLogger.success(`✅ No JavaScript errors`);
  }

  debugLogger.info('─'.repeat(50), 'INFO');
}

// ============================================================
// Activation du debug
// ============================================================
async function activateDebug() {
  if (debugState.active) {
    console.log('[debug.js] Debug already active');
    return;
  }

  console.log('[debug.js] Activating debug...');
  debugState.active = true;
  localStorage.setItem(DEBUG_CONFIG.storageKey, 'true');

  // Afficher l'UI
  if (debugUI) {
    debugUI.initUI();
    debugUI.show();
  }

  // Lancer les tests
  await runAllTests();

  console.log('[debug.js] ✅ Debug activated');
}

// ============================================================
// Désactivation du debug
// ============================================================
function deactivateDebug() {
  if (!debugState.active) {
    console.log('[debug.js] Debug already inactive');
    return;
  }

  console.log('[debug.js] Deactivating debug...');
  debugState.active = false;
  localStorage.setItem(DEBUG_CONFIG.storageKey, 'false');

  // Masquer l'UI
  if (debugUI) {
    debugUI.hide();
  }

  console.log('[debug.js] ✅ Debug deactivated');
}

// ============================================================
// Toggle debug
// ============================================================
async function toggleDebug() {
  if (debugState.active) {
    deactivateDebug();
  } else {
    await activateDebug();
  }
}

// ============================================================
// Initialisation
// ============================================================
async function init() {
  if (debugState.initialized) {
    console.log('[debug.js] Already initialized');
    return;
  }

  console.log('[debug.js] Initializing...');
  debugState.startTime = Date.now();

  // Configurer la capture d'erreurs
  setupErrorCapture();

  // Charger les modules
  const modulesLoaded = await loadDebugModules();
  
  if (!modulesLoaded) {
    console.error('[debug.js] ❌ Failed to load modules');
    return;
  }

  // Initialiser l'UI
  if (debugUI) {
    debugUI.initUI();
  }

  // Vérifier si debug était activé
  const savedState = localStorage.getItem(DEBUG_CONFIG.storageKey);
  if (savedState === 'true') {
    console.log('[debug.js] Debug was previously active, reactivating...');
    await activateDebug();
  }

  debugState.initialized = true;
  console.log('[debug.js] ✅ Initialization complete');
}

// ============================================================
// Auto-initialisation au chargement du DOM
// ============================================================
if (DEBUG_CONFIG.autoInit) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM déjà chargé
    init();
  }
}

// ============================================================
// Export de l'API publique
// ============================================================
window.StopAddictDebug = {
  version: DEBUG_CONFIG.version,
  activate: activateDebug,
  deactivate: deactivateDebug,
  toggle: toggleDebug,
  getState: () => ({ ...debugState }),
  getResults: () => ({ ...debugState.results }),
  runTests: runAllTests
};

console.log('[debug.js] ✅ StopAddict Debug Tool loaded');
console.log('[debug.js] 💡 Use window.StopAddictDebug to control the debug tool');
