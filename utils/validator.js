// ============================================================
// validator.js - Validation de concordance
// ============================================================
// Rôle : Vérifie que les fichiers de config sont cohérents
//        avec les fichiers de test
// Dépendances : Aucune (peut fonctionner de manière autonome)
// ============================================================

console.log('[validator.js] Module loaded');

// ============================================================
// Validation IDs
// ============================================================
export function validateIDs(idsConfig, testFile) {
  console.log('[validator] Validating IDs concordance...');
  
  const result = {
    valid: true,
    totalConfigIds: 0,
    totalTestIds: 0,
    inConfigNotInTest: [],
    inTestNotInConfig: [],
    duplicatesInConfig: [],
    duplicatesInTest: [],
    errors: []
  };

  try {
    // Extraire tous les IDs du config
    const configIds = new Set();
    const configIdsList = [];
    
    if (idsConfig && idsConfig.categories) {
      Object.values(idsConfig.categories).forEach(category => {
        if (Array.isArray(category.ids)) {
          category.ids.forEach(id => {
            if (configIds.has(id)) {
              result.duplicatesInConfig.push(id);
            }
            configIds.add(id);
            configIdsList.push(id);
          });
        }
      });
    }
    
    result.totalConfigIds = configIds.size;
    console.log(`[validator] Config IDs: ${result.totalConfigIds}`);

    // Extraire les IDs du fichier de test (simulation)
    // Dans un vrai environnement, on parserait le fichier JS
    const testIds = extractIDsFromTestFile(testFile);
    result.totalTestIds = testIds.size;
    console.log(`[validator] Test IDs: ${result.totalTestIds}`);

    // Comparer
    configIds.forEach(id => {
      if (!testIds.has(id)) {
        result.inConfigNotInTest.push(id);
        result.valid = false;
      }
    });

    testIds.forEach(id => {
      if (!configIds.has(id)) {
        result.inTestNotInConfig.push(id);
        result.valid = false;
      }
    });

    // Vérifier doublons dans test
    const testIdsList = Array.from(testIds);
    const testIdsCount = {};
    testIdsList.forEach(id => {
      testIdsCount[id] = (testIdsCount[id] || 0) + 1;
    });
    Object.entries(testIdsCount).forEach(([id, count]) => {
      if (count > 1) {
        result.duplicatesInTest.push(id);
      }
    });

    // Résumé
    if (result.valid && result.duplicatesInConfig.length === 0 && result.duplicatesInTest.length === 0) {
      console.log('[validator] ✅ IDs validation: PASSED');
    } else {
      console.error('[validator] ❌ IDs validation: FAILED');
      if (result.inConfigNotInTest.length > 0) {
        console.error(`  - ${result.inConfigNotInTest.length} IDs in config but not tested`);
      }
      if (result.inTestNotInConfig.length > 0) {
        console.error(`  - ${result.inTestNotInConfig.length} IDs tested but not in config`);
      }
      if (result.duplicatesInConfig.length > 0) {
        console.error(`  - ${result.duplicatesInConfig.length} duplicate IDs in config`);
      }
      if (result.duplicatesInTest.length > 0) {
        console.error(`  - ${result.duplicatesInTest.length} duplicate IDs in test`);
      }
    }

  } catch (e) {
    result.errors.push(`Validation error: ${e.message}`);
    result.valid = false;
    console.error('[validator] ❌ IDs validation error:', e);
  }

  return result;
}

// ============================================================
// Validation Modules
// ============================================================
export function validateModules(modulesConfig, testFile) {
  console.log('[validator] Validating modules concordance...');
  
  const result = {
    valid: true,
    totalConfigModules: 0,
    totalTestModules: 0,
    inConfigNotInTest: [],
    inTestNotInConfig: [],
    exportsMismatch: [],
    errors: []
  };

  try {
    // Extraire les modules du config
    const configModules = new Set();
    const configExports = {};
    
    if (modulesConfig && modulesConfig.modules) {
      Object.entries(modulesConfig.modules).forEach(([moduleName, moduleInfo]) => {
        configModules.add(moduleName);
        configExports[moduleName] = moduleInfo.exports || [];
      });
    }
    
    result.totalConfigModules = configModules.size;
    console.log(`[validator] Config modules: ${result.totalConfigModules}`);

    // Extraire les modules du fichier de test (simulation)
    const testModules = extractModulesFromTestFile(testFile);
    result.totalTestModules = testModules.size;
    console.log(`[validator] Test modules: ${result.totalTestModules}`);

    // Comparer
    configModules.forEach(moduleName => {
      if (!testModules.has(moduleName)) {
        result.inConfigNotInTest.push(moduleName);
        result.valid = false;
      }
    });

    testModules.forEach(moduleName => {
      if (!configModules.has(moduleName)) {
        result.inTestNotInConfig.push(moduleName);
        result.valid = false;
      }
    });

    // Résumé
    if (result.valid) {
      console.log('[validator] ✅ Modules validation: PASSED');
    } else {
      console.error('[validator] ❌ Modules validation: FAILED');
      if (result.inConfigNotInTest.length > 0) {
        console.error(`  - ${result.inConfigNotInTest.length} modules in config but not tested`);
      }
      if (result.inTestNotInConfig.length > 0) {
        console.error(`  - ${result.inTestNotInConfig.length} modules tested but not in config`);
      }
    }

  } catch (e) {
    result.errors.push(`Validation error: ${e.message}`);
    result.valid = false;
    console.error('[validator] ❌ Modules validation error:', e);
  }

  return result;
}

// ============================================================
// Validation Events
// ============================================================
export function validateEvents(eventsConfig, testFile) {
  console.log('[validator] Validating events concordance...');
  
  const result = {
    valid: true,
    totalConfigEvents: 0,
    totalTestEvents: 0,
    inConfigNotInTest: [],
    inTestNotInConfig: [],
    errors: []
  };

  try {
    // Extraire les événements du config
    const configEvents = new Set();
    
    if (eventsConfig && eventsConfig.events) {
      Object.keys(eventsConfig.events).forEach(eventName => {
        configEvents.add(eventName);
      });
    }
    
    result.totalConfigEvents = configEvents.size;
    console.log(`[validator] Config events: ${result.totalConfigEvents}`);

    // Extraire les événements du fichier de test (simulation)
    const testEvents = extractEventsFromTestFile(testFile);
    result.totalTestEvents = testEvents.size;
    console.log(`[validator] Test events: ${result.totalTestEvents}`);

    // Comparer
    configEvents.forEach(eventName => {
      if (!testEvents.has(eventName)) {
        result.inConfigNotInTest.push(eventName);
        result.valid = false;
      }
    });

    testEvents.forEach(eventName => {
      if (!configEvents.has(eventName)) {
        result.inTestNotInConfig.push(eventName);
        result.valid = false;
      }
    });

    // Résumé
    if (result.valid) {
      console.log('[validator] ✅ Events validation: PASSED');
    } else {
      console.error('[validator] ❌ Events validation: FAILED');
    }

  } catch (e) {
    result.errors.push(`Validation error: ${e.message}`);
    result.valid = false;
    console.error('[validator] ❌ Events validation error:', e);
  }

  return result;
}

// ============================================================
// Validation complète
// ============================================================
export function validateAll(configs, testFiles) {
  console.log('[validator] Running full validation...');
  
  const results = {
    ids: null,
    modules: null,
    events: null,
    allValid: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Valider IDs
    if (configs.ids && testFiles.dom) {
      results.ids = validateIDs(configs.ids, testFiles.dom);
    }

    // Valider Modules
    if (configs.modules && testFiles.modules) {
      results.modules = validateModules(configs.modules, testFiles.modules);
    }

    // Valider Events
    if (configs.events && testFiles.events) {
      results.events = validateEvents(configs.events, testFiles.events);
    }

    // Vérifier si tout est valide
    results.allValid = (
      (!results.ids || results.ids.valid) &&
      (!results.modules || results.modules.valid) &&
      (!results.events || results.events.valid)
    );

    if (results.allValid) {
      console.log('[validator] ✅ Full validation: PASSED');
    } else {
      console.error('[validator] ❌ Full validation: FAILED');
    }

  } catch (e) {
    console.error('[validator] ❌ Full validation error:', e);
    results.error = e.message;
  }

  return results;
}

// ============================================================
// Fonctions utilitaires (simulation)
// ============================================================
function extractIDsFromTestFile(testFile) {
  // Simulation : dans un vrai environnement, on parserait le fichier
  const ids = new Set();
  
  if (testFile && testFile.content) {
    const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = regex.exec(testFile.content)) !== null) {
      ids.add(match[1]);
    }
  }
  
  return ids;
}

function extractModulesFromTestFile(testFile) {
  // Simulation
  const modules = new Set();
  
  if (testFile && testFile.content) {
    const regex = /MODULES_TO_TEST\s*=\s*\{([^}]+)\}/gs;
    const match = regex.exec(testFile.content);
    if (match) {
      const moduleRegex = /'([^']+\.js)':/g;
      let moduleMatch;
      while ((moduleMatch = moduleRegex.exec(match[1])) !== null) {
        modules.add(moduleMatch[1]);
      }
    }
  }
  
  return modules;
}

function extractEventsFromTestFile(testFile) {
  // Simulation
  const events = new Set();
  
  if (testFile && testFile.content) {
    const regex = /EVENTS_TO_TEST\s*=\s*\[([^\]]+)\]/gs;
    const match = regex.exec(testFile.content);
    if (match) {
      const eventRegex = /'([^']+)'/g;
      let eventMatch;
      while ((eventMatch = eventRegex.exec(match[1])) !== null) {
        events.add(eventMatch[1]);
      }
    }
  }
  
  return events;
}

// ============================================================
// Export
// ============================================================
console.log('[validator.js] Ready - Functions exported:', {
  validateIDs: typeof validateIDs,
  validateModules: typeof validateModules,
  validateEvents: typeof validateEvents,
  validateAll: typeof validateAll
});
