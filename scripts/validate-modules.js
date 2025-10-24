#!/usr/bin/env node

// ============================================================
// validate-modules.js - Validation des modules JS
// ============================================================
// Rôle : Vérifie que tous les modules du config sont testés
// Usage : node scripts/validate-modules.js
// ============================================================

const fs = require('fs');
const path = require('path');

console.log('🔍 Validate Modules - Debug Tool StopAddict');
console.log('='.repeat(70));

// ============================================================
// Configuration
// ============================================================
const CONFIG = {
  configFile: path.join(__dirname, '..', 'config', 'modules-list.json'),
  testFile: path.join(__dirname, '..', 'debug', 'debug-modules.js'),
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

// ============================================================
// Utilitaires
// ============================================================
function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌'
  };
  console.log(`${icons[type] || ''} ${message}`);
}

function logVerbose(message) {
  if (CONFIG.verbose) {
    console.log(`  ${message}`);
  }
}

// ============================================================
// Chargement des fichiers
// ============================================================
function loadConfigModules() {
  log('Loading config modules from modules-list.json...');
  
  try {
    const content = fs.readFileSync(CONFIG.configFile, 'utf8');
    const config = JSON.parse(content);
    
    const modules = new Map();
    
    if (config.modules) {
      Object.entries(config.modules).forEach(([moduleName, moduleInfo]) => {
        modules.set(moduleName, {
          path: moduleInfo.path,
          critical: moduleInfo.critical,
          exports: moduleInfo.exports || []
        });
      });
    }
    
    log(`✓ Loaded ${modules.size} modules from config`, 'success');
    return { modules, totalModules: config.totalModules };
    
  } catch (e) {
    log(`Failed to load config: ${e.message}`, 'error');
    process.exit(1);
  }
}

function loadTestModules() {
  log('Loading test modules from debug-modules.js...');
  
  try {
    const content = fs.readFileSync(CONFIG.testFile, 'utf8');
    
    // Extraire MODULES_TO_TEST
    const MODULES_TO_TEST_regex = /const MODULES_TO_TEST = \{([\s\S]*?)\};/;
    const match = content.match(MODULES_TO_TEST_regex);
    
    if (!match) {
      log('Cannot find MODULES_TO_TEST object in debug-modules.js', 'error');
      process.exit(1);
    }
    
    const modules = new Map();
    const modulesString = match[1];
    
    // Extraire chaque module
    const moduleRegex = /'([^']+\.js)':\s*\{([^}]+)\}/g;
    let moduleMatch;
    
    while ((moduleMatch = moduleRegex.exec(modulesString)) !== null) {
      const moduleName = moduleMatch[1];
      const moduleContent = moduleMatch[2];
      
      // Extraire les exports
      const exportsRegex = /exports:\s*\[([\s\S]*?)\]/;
      const exportsMatch = moduleContent.match(exportsRegex);
      
      const exports = [];
      if (exportsMatch) {
        const exportsString = exportsMatch[1];
        const exportMatches = exportsString.match(/'([^']+)'/g);
        if (exportMatches) {
          exportMatches.forEach(exp => {
            exports.push(exp.replace(/'/g, ''));
          });
        }
      }
      
      // Extraire critical
      const criticalRegex = /critical:\s*(true|false)/;
      const criticalMatch = moduleContent.match(criticalRegex);
      const critical = criticalMatch ? criticalMatch[1] === 'true' : false;
      
      modules.set(moduleName, { exports, critical });
    }
    
    log(`✓ Loaded ${modules.size} modules from test file`, 'success');
    
    return { modules };
    
  } catch (e) {
    log(`Failed to load test file: ${e.message}`, 'error');
    process.exit(1);
  }
}

// ============================================================
// Validation
// ============================================================
function validateModules(configData, testData) {
  log('\n--- Validating modules concordance ---');
  
  const results = {
    valid: true,
    totalConfig: configData.modules.size,
    totalTest: testData.modules.size,
    inConfigNotInTest: [],
    inTestNotInConfig: [],
    exportsMismatch: [],
    criticalMissing: []
  };
  
  // Modules dans config mais pas dans test
  configData.modules.forEach((configInfo, moduleName) => {
    if (!testData.modules.has(moduleName)) {
      results.inConfigNotInTest.push(moduleName);
      results.valid = false;
      
      if (configInfo.critical) {
        results.criticalMissing.push(moduleName);
      }
    } else {
      // Vérifier les exports
      const testInfo = testData.modules.get(moduleName);
      const configExports = new Set(configInfo.exports);
      const testExports = new Set(testInfo.exports);
      
      const missingExports = [];
      configExports.forEach(exp => {
        if (!testExports.has(exp)) {
          missingExports.push(exp);
        }
      });
      
      if (missingExports.length > 0) {
        results.exportsMismatch.push({
          module: moduleName,
          missing: missingExports
        });
        results.valid = false;
      }
    }
  });
  
  // Modules dans test mais pas dans config
  testData.modules.forEach((testInfo, moduleName) => {
    if (!configData.modules.has(moduleName)) {
      results.inTestNotInConfig.push(moduleName);
    }
  });
  
  return results;
}

// ============================================================
// Affichage des résultats
// ============================================================
function displayResults(results, configData) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(70));
  
  console.log(`Config modules: ${results.totalConfig}`);
  console.log(`Test modules: ${results.totalTest}`);
  console.log(`Expected total: ${configData.totalModules || 'N/A'}`);
  
  if (results.inConfigNotInTest.length > 0) {
    console.log(`\n❌ ${results.inConfigNotInTest.length} modules in config but NOT TESTED:`);
    results.inConfigNotInTest.forEach(moduleName => {
      console.log(`   - ${moduleName}`);
    });
  }
  
  if (results.criticalMissing.length > 0) {
    console.log(`\n❌ ${results.criticalMissing.length} CRITICAL modules not tested:`);
    results.criticalMissing.forEach(moduleName => {
      console.log(`   - ${moduleName}`);
    });
  }
  
  if (results.inTestNotInConfig.length > 0) {
    console.log(`\n⚠️  ${results.inTestNotInConfig.length} modules tested but NOT IN CONFIG:`);
    results.inTestNotInConfig.forEach(moduleName => {
      console.log(`   - ${moduleName}`);
    });
  }
  
  if (results.exportsMismatch.length > 0) {
    console.log(`\n⚠️  ${results.exportsMismatch.length} modules with EXPORTS MISMATCH:`);
    results.exportsMismatch.forEach(item => {
      console.log(`   - ${item.module}:`);
      item.missing.forEach(exp => {
        console.log(`     • Missing: ${exp}`);
      });
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (results.valid) {
    log('✅ All modules validation passed!', 'success');
    return 0;
  } else {
    log('❌ Modules validation failed!', 'error');
    return 1;
  }
}

// ============================================================
// Main
// ============================================================
function main() {
  try {
    const configData = loadConfigModules();
    const testData = loadTestModules();
    const results = validateModules(configData, testData);
    const exitCode = displayResults(results, configData);
    
    process.exit(exitCode);
    
  } catch (e) {
    console.error('\n❌ FATAL ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

// Exécuter
main();
