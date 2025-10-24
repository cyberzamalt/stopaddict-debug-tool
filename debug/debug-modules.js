// ============================================================
// debug-modules.js - Tests des modules JS
// ============================================================
// Rôle : Vérifie le chargement et les exports des modules
// Dépendances : debug-logger.js, config/modules-list.json
// ============================================================

console.log('[debug-modules.js] Module loaded');

import { info, success, warning, error } from './debug-logger.js';

// ============================================================
// Configuration des modules à tester
// ============================================================
const MODULES_TO_TEST = {
  'state.js': {
    path: './js/state.js',
    critical: true,
    exports: [
      'emit', 'on', 'getCurrentRange', 'setCurrentRange', 'ymd',
      'getSettings', 'saveSettings', 'setSetting',
      'getLimits', 'saveLimits',
      'getEconomy', 'saveEconomy',
      'getWarnState', 'saveWarnState',
      'getDaily', 'getAllDaily',
      'addEntry', 'removeEntry',
      'totalsForDate', 'totalsForWeek', 'totalsForMonth', 'totalsForYear',
      'getAggregates', 'getTotalsForRange'
    ]
  },
  'app.js': {
    path: './js/app.js',
    critical: true,
    exports: [] // app.js n'exporte rien, c'est l'orchestrateur
  },
  'counters.js': {
    path: './js/counters.js',
    critical: true,
    exports: ['initCounters']
  },
  'charts.js': {
    path: './js/charts.js',
    critical: true,
    exports: ['initCharts']
  },
  'modals.js': {
    path: './js/modals.js',
    critical: true,
    exports: ['initModals']
  },
  'stats.js': {
    path: './js/stats.js',
    critical: false,
    exports: ['initStats']
  },
  'calendar.js': {
    path: './js/calendar.js',
    critical: false,
    exports: ['initCalendar']
  },
  'export.js': {
    path: './js/export.js',
    critical: false,
    exports: ['initExport']
  },
  'settings.js': {
    path: './js/settings.js',
    critical: false,
    exports: ['initSettings']
  },
  'economy.js': {
    path: './js/economy.js',
    critical: false,
    exports: ['initEconomy']
  },
  'limits.js': {
    path: './js/limits.js',
    critical: false,
    exports: ['initLimits']
  }
};

// ============================================================
// Tests principaux
// ============================================================
export async function testModules() {
  info('Testing JavaScript modules...', 'DEBUG');
  
  const results = {
    total: Object.keys(MODULES_TO_TEST).length,
    tested: 0,
    passed: 0,
    failed: 0,
    criticalFailed: 0,
    modules: {},
    startTime: performance.now()
  };

  for (const [moduleName, config] of Object.entries(MODULES_TO_TEST)) {
    results.tested++;
    const moduleResult = await testModule(moduleName, config);
    results.modules[moduleName] = moduleResult;

    if (moduleResult.loaded && moduleResult.exportsValid) {
      results.passed++;
    } else {
      results.failed++;
      if (config.critical) {
        results.criticalFailed++;
      }
    }
  }

  results.endTime = performance.now();
  results.duration = Math.round(results.endTime - results.startTime);

  // Résumé
  if (results.failed === 0) {
    success(`Modules: ${results.passed}/${results.total} OK (${results.duration}ms)`);
  } else if (results.criticalFailed > 0) {
    error(`Modules: ${results.criticalFailed} critical failures!`);
  } else {
    warning(`Modules: ${results.failed} non-critical failures`);
  }

  return results;
}

// ============================================================
// Test d'un module spécifique
// ============================================================
async function testModule(moduleName, config) {
  const startTime = performance.now();
  
  const result = {
    name: moduleName,
    path: config.path,
    critical: config.critical,
    loaded: false,
    loadTime: 0,
    exportsValid: false,
    exportsFound: [],
    exportsMissing: [],
    errors: []
  };

  try {
    info(`Testing ${moduleName}...`, 'DEBUG');

    // Tenter d'importer le module
    let module;
    try {
      module = await import(config.path);
      result.loaded = true;
      result.loadTime = Math.round(performance.now() - startTime);
      success(`${moduleName} loaded (${result.loadTime}ms)`);
    } catch (importError) {
      result.loaded = false;
      result.errors.push(`Import failed: ${importError.message}`);
      error(`${moduleName}: Import failed - ${importError.message}`);
      return result;
    }

    // Vérifier les exports attendus
    if (config.exports.length === 0) {
      // Module sans exports (comme app.js)
      result.exportsValid = true;
      info(`${moduleName}: No exports expected`);
    } else {
      // Vérifier chaque export
      for (const exportName of config.exports) {
        if (module[exportName] !== undefined) {
          result.exportsFound.push(exportName);
        } else {
          result.exportsMissing.push(exportName);
          warning(`${moduleName}: Missing export '${exportName}'`);
        }
      }

      result.exportsValid = result.exportsMissing.length === 0;

      if (result.exportsValid) {
        success(`${moduleName}: All ${config.exports.length} exports found`);
      } else {
        error(`${moduleName}: ${result.exportsMissing.length} exports missing`);
      }
    }

  } catch (e) {
    result.errors.push(`Test error: ${e.message}`);
    error(`${moduleName}: Test error - ${e.message}`);
  }

  return result;
}

// ============================================================
// Test de state.js (le plus important)
// ============================================================
export async function testStateModule() {
  info('Testing state.js in detail...', 'DEBUG');
  
  const result = {
    loaded: false,
    eventBusWorks: false,
    functionsWork: {},
    errors: []
  };

  try {
    // Importer state.js
    const state = await import('./js/state.js');
    result.loaded = true;
    success('state.js: Import successful');

    // Tester l'event bus
    try {
      if (typeof state.emit === 'function' && typeof state.on === 'function') {
        // Tester emit/on
        let eventReceived = false;
        const testHandler = () => { eventReceived = true; };
        
        state.on('test-event', testHandler);
        state.emit('test-event', {});
        
        if (eventReceived) {
          result.eventBusWorks = true;
          success('state.js: Event bus works');
        } else {
          warning('state.js: Event bus not working');
        }
      }
    } catch (e) {
      result.errors.push(`Event bus test failed: ${e.message}`);
      error('state.js: Event bus test failed', e);
    }

    // Tester quelques fonctions critiques
    const criticalFunctions = [
      'getSettings', 'getDaily', 'addEntry', 'totalsForDate', 'getAggregates'
    ];

    for (const funcName of criticalFunctions) {
      try {
        if (typeof state[funcName] === 'function') {
          // Appel test (sans paramètres)
          const testResult = state[funcName]();
          result.functionsWork[funcName] = true;
          success(`state.js: ${funcName}() works`);
        } else {
          result.functionsWork[funcName] = false;
          warning(`state.js: ${funcName} not a function`);
        }
      } catch (e) {
        result.functionsWork[funcName] = false;
        result.errors.push(`${funcName}() error: ${e.message}`);
        warning(`state.js: ${funcName}() error - ${e.message}`);
      }
    }

  } catch (e) {
    result.errors.push(`State module test failed: ${e.message}`);
    error('state.js: Test failed', e);
  }

  return result;
}

// ============================================================
// Test de Chart.js (dépendance externe)
// ============================================================
export function testChartJS() {
  info('Testing Chart.js...', 'DEBUG');
  
  const result = {
    available: false,
    version: null,
    error: null
  };

  try {
    // Vérifier si Chart.js est disponible globalement
    if (typeof window.Chart !== 'undefined') {
      result.available = true;
      result.version = window.Chart.version || 'unknown';
      success(`Chart.js: Available (v${result.version})`);
    } else {
      result.error = 'window.Chart is undefined';
      error('Chart.js: Not available');
    }
  } catch (e) {
    result.error = e.message;
    error('Chart.js: Test error', e);
  }

  return result;
}

// ============================================================
// Tests des imports ES6
// ============================================================
export function testES6Support() {
  info('Testing ES6 module support...', 'DEBUG');
  
  const result = {
    supported: false,
    features: {
      import: false,
      export: false,
      async: false,
      arrow: false,
      destructuring: false
    }
  };

  try {
    // Test import/export (déjà testé si on arrive ici)
    result.features.import = true;
    result.features.export = true;

    // Test async/await
    try {
      eval('(async () => {})');
      result.features.async = true;
    } catch (e) {
      result.features.async = false;
    }

    // Test arrow functions
    try {
      eval('() => {}');
      result.features.arrow = true;
    } catch (e) {
      result.features.arrow = false;
    }

    // Test destructuring
    try {
      eval('const {a} = {a: 1}');
      result.features.destructuring = true;
    } catch (e) {
      result.features.destructuring = false;
    }

    // Vérifier si tous les features sont supportés
    result.supported = Object.values(result.features).every(v => v === true);

    if (result.supported) {
      success('ES6: Fully supported');
    } else {
      warning('ES6: Partial support');
    }

  } catch (e) {
    error('ES6: Test error', e);
  }

  return result;
}

// ============================================================
// Résumé global
// ============================================================
export async function getModulesSummary() {
  const modulesResult = await testModules();
  const stateResult = await testStateModule();
  const chartResult = testChartJS();
  const es6Result = testES6Support();

  return {
    modules: modulesResult,
    state: stateResult,
    chart: chartResult,
    es6: es6Result,
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// Export
// ============================================================
console.log('[debug-modules.js] Ready - Functions exported:', {
  testModules: typeof testModules,
  testStateModule: typeof testStateModule,
  testChartJS: typeof testChartJS,
  testES6Support: typeof testES6Support,
  getModulesSummary: typeof getModulesSummary,
  totalModules: Object.keys(MODULES_TO_TEST).length
});
