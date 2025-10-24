#!/usr/bin/env node

// ============================================================
// check-concordance.js - Vérification globale de concordance
// ============================================================
// Rôle : Vérifie que tous les fichiers sont cohérents entre eux
// Usage : node scripts/check-concordance.js
// ============================================================

const fs = require('fs');
const path = require('path');

console.log('🔍 Check Concordance - Debug Tool StopAddict');
console.log('='.repeat(70));

// ============================================================
// Configuration
// ============================================================
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  configDir: path.join(__dirname, '..', 'config'),
  debugDir: path.join(__dirname, '..', 'debug'),
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

// ============================================================
// Résultats globaux
// ============================================================
let globalResults = {
  totalChecks: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

// ============================================================
// Utilitaires
// ============================================================
function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
    debug: '🔍'
  };
  
  const icon = icons[type] || '';
  console.log(`${icon} ${message}`);
}

function logVerbose(message) {
  if (CONFIG.verbose) {
    console.log(`  ${message}`);
  }
}

function loadJSON(filePath) {
  try {
    logVerbose(`Loading ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    log(`Cannot load ${filePath}: ${e.message}`, 'error');
    globalResults.errors.push(`Load error: ${filePath} - ${e.message}`);
    return null;
  }
}

function loadFile(filePath) {
  try {
    logVerbose(`Reading ${filePath}...`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    log(`Cannot read ${filePath}: ${e.message}`, 'error');
    globalResults.errors.push(`Read error: ${filePath} - ${e.message}`);
    return null;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

// ============================================================
// Check 1 : Fichiers de configuration existent
// ============================================================
function checkConfigFilesExist() {
  log('\n--- Check 1/6: Configuration files exist ---');
  globalResults.totalChecks++;
  
  const requiredFiles = [
    'config/ids-list.json',
    'config/modules-list.json',
    'config/events-list.json',
    'config/localStorage-keys.json'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(CONFIG.rootDir, file);
    if (fileExists(fullPath)) {
      logVerbose(`✓ ${file} exists`);
    } else {
      log(`Missing: ${file}`, 'error');
      allExist = false;
      globalResults.errors.push(`Missing config file: ${file}`);
    }
  });
  
  if (allExist) {
    log('All config files exist', 'success');
    globalResults.passed++;
  } else {
    log('Some config files are missing', 'error');
    globalResults.failed++;
  }
  
  return allExist;
}

// ============================================================
// Check 2 : Fichiers de debug existent
// ============================================================
function checkDebugFilesExist() {
  log('\n--- Check 2/6: Debug files exist ---');
  globalResults.totalChecks++;
  
  const requiredFiles = [
    'debug/debug.js',
    'debug/debug-logger.js',
    'debug/debug-ui.js',
    'debug/debug-modules.js',
    'debug/debug-dom.js',
    'debug/debug-storage.js',
    'debug/debug-events.js',
    'debug/debug-chart.js',
    'debug/debug-fallbacks.js'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(CONFIG.rootDir, file);
    if (fileExists(fullPath)) {
      logVerbose(`✓ ${file} exists`);
    } else {
      log(`Missing: ${file}`, 'error');
      allExist = false;
      globalResults.errors.push(`Missing debug file: ${file}`);
    }
  });
  
  if (allExist) {
    log('All debug files exist', 'success');
    globalResults.passed++;
  } else {
    log('Some debug files are missing', 'error');
    globalResults.failed++;
  }
  
  return allExist;
}

// ============================================================
// Check 3 : IDs concordance
// ============================================================
function checkIDsConcordance() {
  log('\n--- Check 3/6: IDs concordance ---');
  globalResults.totalChecks++;
  
  // Charger ids-list.json
  const idsConfig = loadJSON(path.join(CONFIG.configDir, 'ids-list.json'));
  if (!idsConfig) {
    log('Cannot load ids-list.json', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Charger debug-dom.js
  const domContent = loadFile(path.join(CONFIG.debugDir, 'debug-dom.js'));
  if (!domContent) {
    log('Cannot load debug-dom.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Extraire les IDs du config
  const configIds = new Set();
  if (idsConfig.categories) {
    Object.values(idsConfig.categories).forEach(category => {
      if (Array.isArray(category.ids)) {
        category.ids.forEach(id => configIds.add(id));
      }
    });
  }
  
  logVerbose(`Config IDs: ${configIds.size}`);
  
  // Extraire les IDs de debug-dom.js
  const IDS_TO_TEST_regex = /const IDS_TO_TEST = \[([\s\S]*?)\];/;
  const match = domContent.match(IDS_TO_TEST_regex);
  
  if (!match) {
    log('Cannot find IDS_TO_TEST in debug-dom.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  const testIds = new Set();
  const idsString = match[1];
  const idMatches = idsString.match(/'([^']+)'/g);
  if (idMatches) {
    idMatches.forEach(idMatch => {
      const id = idMatch.replace(/'/g, '');
      testIds.add(id);
    });
  }
  
  logVerbose(`Test IDs: ${testIds.size}`);
  
  // Comparer
  const inConfigNotInTest = [];
  const inTestNotInConfig = [];
  
  configIds.forEach(id => {
    if (!testIds.has(id)) {
      inConfigNotInTest.push(id);
    }
  });
  
  testIds.forEach(id => {
    if (!configIds.has(id)) {
      inTestNotInConfig.push(id);
    }
  });
  
  // Résultats
  if (inConfigNotInTest.length === 0 && inTestNotInConfig.length === 0) {
    log(`IDs concordance: ${configIds.size} IDs match`, 'success');
    globalResults.passed++;
    return true;
  } else {
    if (inConfigNotInTest.length > 0) {
      log(`${inConfigNotInTest.length} IDs in config but not tested`, 'error');
      logVerbose(`Missing in test: ${inConfigNotInTest.slice(0, 5).join(', ')}...`);
      globalResults.errors.push(`${inConfigNotInTest.length} IDs not tested`);
    }
    if (inTestNotInConfig.length > 0) {
      log(`${inTestNotInConfig.length} IDs tested but not in config`, 'warning');
      logVerbose(`Extra in test: ${inTestNotInConfig.slice(0, 5).join(', ')}...`);
      globalResults.warnings++;
    }
    globalResults.failed++;
    return false;
  }
}

// ============================================================
// Check 4 : Modules concordance
// ============================================================
function checkModulesConcordance() {
  log('\n--- Check 4/6: Modules concordance ---');
  globalResults.totalChecks++;
  
  // Charger modules-list.json
  const modulesConfig = loadJSON(path.join(CONFIG.configDir, 'modules-list.json'));
  if (!modulesConfig) {
    log('Cannot load modules-list.json', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Charger debug-modules.js
  const modulesContent = loadFile(path.join(CONFIG.debugDir, 'debug-modules.js'));
  if (!modulesContent) {
    log('Cannot load debug-modules.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Extraire les modules du config
  const configModules = new Set();
  if (modulesConfig.modules) {
    Object.keys(modulesConfig.modules).forEach(moduleName => {
      configModules.add(moduleName);
    });
  }
  
  logVerbose(`Config modules: ${configModules.size}`);
  
  // Extraire les modules de debug-modules.js
  const MODULES_TO_TEST_regex = /const MODULES_TO_TEST = \{([\s\S]*?)\};/;
  const match = modulesContent.match(MODULES_TO_TEST_regex);
  
  if (!match) {
    log('Cannot find MODULES_TO_TEST in debug-modules.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  const testModules = new Set();
  const modulesString = match[1];
  const moduleMatches = modulesString.match(/'([^']+\.js)':/g);
  if (moduleMatches) {
    moduleMatches.forEach(moduleMatch => {
      const moduleName = moduleMatch.replace(/['":]/g, '');
      testModules.add(moduleName);
    });
  }
  
  logVerbose(`Test modules: ${testModules.size}`);
  
  // Comparer
  const inConfigNotInTest = [];
  const inTestNotInConfig = [];
  
  configModules.forEach(moduleName => {
    if (!testModules.has(moduleName)) {
      inConfigNotInTest.push(moduleName);
    }
  });
  
  testModules.forEach(moduleName => {
    if (!configModules.has(moduleName)) {
      inTestNotInConfig.push(moduleName);
    }
  });
  
  // Résultats
  if (inConfigNotInTest.length === 0 && inTestNotInConfig.length === 0) {
    log(`Modules concordance: ${configModules.size} modules match`, 'success');
    globalResults.passed++;
    return true;
  } else {
    if (inConfigNotInTest.length > 0) {
      log(`${inConfigNotInTest.length} modules in config but not tested`, 'error');
      globalResults.errors.push(`${inConfigNotInTest.length} modules not tested`);
    }
    if (inTestNotInConfig.length > 0) {
      log(`${inTestNotInConfig.length} modules tested but not in config`, 'warning');
      globalResults.warnings++;
    }
    globalResults.failed++;
    return false;
  }
}

// ============================================================
// Check 5 : Events concordance
// ============================================================
function checkEventsConcordance() {
  log('\n--- Check 5/6: Events concordance ---');
  globalResults.totalChecks++;
  
  // Charger events-list.json
  const eventsConfig = loadJSON(path.join(CONFIG.configDir, 'events-list.json'));
  if (!eventsConfig) {
    log('Cannot load events-list.json', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Charger debug-events.js
  const eventsContent = loadFile(path.join(CONFIG.debugDir, 'debug-events.js'));
  if (!eventsContent) {
    log('Cannot load debug-events.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Extraire les événements du config
  const configEvents = new Set();
  if (eventsConfig.events) {
    Object.keys(eventsConfig.events).forEach(eventName => {
      configEvents.add(eventName);
    });
  }
  
  logVerbose(`Config events: ${configEvents.size}`);
  
  // Extraire les événements de debug-events.js
  const EVENTS_TO_TEST_regex = /const EVENTS_TO_TEST = \[([\s\S]*?)\];/;
  const match = eventsContent.match(EVENTS_TO_TEST_regex);
  
  if (!match) {
    log('Cannot find EVENTS_TO_TEST in debug-events.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  const testEvents = new Set();
  const eventsString = match[1];
  const eventMatches = eventsString.match(/'([^']+)'/g);
  if (eventMatches) {
    eventMatches.forEach(eventMatch => {
      const eventName = eventMatch.replace(/'/g, '');
      testEvents.add(eventName);
    });
  }
  
  logVerbose(`Test events: ${testEvents.size}`);
  
  // Comparer
  const inConfigNotInTest = [];
  const inTestNotInConfig = [];
  
  configEvents.forEach(eventName => {
    if (!testEvents.has(eventName)) {
      inConfigNotInTest.push(eventName);
    }
  });
  
  testEvents.forEach(eventName => {
    if (!configEvents.has(eventName)) {
      inTestNotInConfig.push(eventName);
    }
  });
  
  // Résultats
  if (inConfigNotInTest.length === 0 && inTestNotInConfig.length === 0) {
    log(`Events concordance: ${configEvents.size} events match`, 'success');
    globalResults.passed++;
    return true;
  } else {
    if (inConfigNotInTest.length > 0) {
      log(`${inConfigNotInTest.length} events in config but not tested`, 'error');
      globalResults.errors.push(`${inConfigNotInTest.length} events not tested`);
    }
    if (inTestNotInConfig.length > 0) {
      log(`${inTestNotInConfig.length} events tested but not in config`, 'warning');
      globalResults.warnings++;
    }
    globalResults.failed++;
    return false;
  }
}

// ============================================================
// Check 6 : Imports/Exports
// ============================================================
function checkImportsExports() {
  log('\n--- Check 6/6: Imports/Exports consistency ---');
  globalResults.totalChecks++;
  
  // Charger debug.js
  const debugContent = loadFile(path.join(CONFIG.debugDir, 'debug.js'));
  if (!debugContent) {
    log('Cannot load debug.js', 'error');
    globalResults.failed++;
    return false;
  }
  
  // Extraire les imports
  const importRegex = /import\s+.*?from\s+['"]\.\/([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(debugContent)) !== null) {
    imports.push(match[1]);
  }
  
  logVerbose(`Found ${imports.length} imports in debug.js`);
  
  // Vérifier que chaque fichier importé existe
  let allExist = true;
  imports.forEach(importFile => {
    const fullPath = path.join(CONFIG.debugDir, importFile);
    if (fileExists(fullPath)) {
      logVerbose(`✓ ${importFile} exists`);
    } else {
      log(`Imported file missing: ${importFile}`, 'error');
      allExist = false;
      globalResults.errors.push(`Missing imported file: ${importFile}`);
    }
  });
  
  if (allExist) {
    log('All imports are valid', 'success');
    globalResults.passed++;
    return true;
  } else {
    log('Some imports are invalid', 'error');
    globalResults.failed++;
    return false;
  }
}

// ============================================================
// Résumé final
// ============================================================
function displaySummary() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total checks: ${globalResults.totalChecks}`);
  console.log(`✅ Passed: ${globalResults.passed}`);
  console.log(`❌ Failed: ${globalResults.failed}`);
  console.log(`⚠️  Warnings: ${globalResults.warnings}`);
  
  if (globalResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    globalResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log('='.repeat(70));
  
  if (globalResults.failed === 0) {
    console.log('✅ All checks passed!');
    return 0;
  } else {
    console.log('❌ Some checks failed!');
    return 1;
  }
}

// ============================================================
// Main
// ============================================================
function main() {
  console.log('Starting concordance checks...\n');
  
  try {
    checkConfigFilesExist();
    checkDebugFilesExist();
    checkIDsConcordance();
    checkModulesConcordance();
    checkEventsConcordance();
    checkImportsExports();
    
    const exitCode = displaySummary();
    process.exit(exitCode);
    
  } catch (e) {
    console.error('\n❌ FATAL ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

// Exécuter
main();
