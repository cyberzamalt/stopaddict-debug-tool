#!/usr/bin/env node

// ============================================================
// validate-ids.js - Validation des IDs HTML
// ============================================================
// Rôle : Vérifie que tous les IDs du config sont testés
// Usage : node scripts/validate-ids.js
// ============================================================

const fs = require('fs');
const path = require('path');

console.log('🔍 Validate IDs - Debug Tool StopAddict');
console.log('='.repeat(70));

// ============================================================
// Configuration
// ============================================================
const CONFIG = {
  configFile: path.join(__dirname, '..', 'config', 'ids-list.json'),
  testFile: path.join(__dirname, '..', 'debug', 'debug-dom.js'),
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
function loadConfigIDs() {
  log('Loading config IDs from ids-list.json...');
  
  try {
    const content = fs.readFileSync(CONFIG.configFile, 'utf8');
    const config = JSON.parse(content);
    
    const ids = new Set();
    const idsByCategory = {};
    
    if (config.categories) {
      Object.entries(config.categories).forEach(([categoryName, category]) => {
        if (Array.isArray(category.ids)) {
          idsByCategory[categoryName] = category.ids;
          category.ids.forEach(id => ids.add(id));
        }
      });
    }
    
    log(`✓ Loaded ${ids.size} IDs from config`, 'success');
    return { ids, idsByCategory, totalIds: config.totalIds };
    
  } catch (e) {
    log(`Failed to load config: ${e.message}`, 'error');
    process.exit(1);
  }
}

function loadTestIDs() {
  log('Loading test IDs from debug-dom.js...');
  
  try {
    const content = fs.readFileSync(CONFIG.testFile, 'utf8');
    
    // Extraire IDS_TO_TEST
    const IDS_TO_TEST_regex = /const IDS_TO_TEST = \[([\s\S]*?)\];/;
    const match = content.match(IDS_TO_TEST_regex);
    
    if (!match) {
      log('Cannot find IDS_TO_TEST array in debug-dom.js', 'error');
      process.exit(1);
    }
    
    const ids = new Set();
    const idsString = match[1];
    
    // Extraire chaque ID
    const idMatches = idsString.match(/'([^']+)'/g);
    if (idMatches) {
      idMatches.forEach(idMatch => {
        const id = idMatch.replace(/'/g, '');
        ids.add(id);
      });
    }
    
    // Extraire CRITICAL_IDS
    const CRITICAL_IDS_regex = /const CRITICAL_IDS = \[([\s\S]*?)\];/;
    const criticalMatch = content.match(CRITICAL_IDS_regex);
    
    const criticalIds = new Set();
    if (criticalMatch) {
      const criticalString = criticalMatch[1];
      const criticalMatches = criticalString.match(/'([^']+)'/g);
      if (criticalMatches) {
        criticalMatches.forEach(idMatch => {
          const id = idMatch.replace(/'/g, '');
          criticalIds.add(id);
        });
      }
    }
    
    log(`✓ Loaded ${ids.size} IDs from test file`, 'success');
    logVerbose(`  Critical IDs: ${criticalIds.size}`);
    
    return { ids, criticalIds };
    
  } catch (e) {
    log(`Failed to load test file: ${e.message}`, 'error');
    process.exit(1);
  }
}

// ============================================================
// Validation
// ============================================================
function validateIDs(configData, testData) {
  log('\n--- Validating IDs concordance ---');
  
  const results = {
    valid: true,
    totalConfig: configData.ids.size,
    totalTest: testData.ids.size,
    inConfigNotInTest: [],
    inTestNotInConfig: [],
    duplicatesInTest: [],
    criticalMissing: []
  };
  
  // IDs dans config mais pas dans test
  configData.ids.forEach(id => {
    if (!testData.ids.has(id)) {
      results.inConfigNotInTest.push(id);
      results.valid = false;
    }
  });
  
  // IDs dans test mais pas dans config
  testData.ids.forEach(id => {
    if (!configData.ids.has(id)) {
      results.inTestNotInConfig.push(id);
      results.valid = false;
    }
  });
  
  // Vérifier les doublons dans test
  const testArray = Array.from(testData.ids);
  const seen = new Set();
  testArray.forEach(id => {
    if (seen.has(id)) {
      results.duplicatesInTest.push(id);
    }
    seen.add(id);
  });
  
  // IDs critiques manquants
  testData.criticalIds.forEach(criticalId => {
    if (!configData.ids.has(criticalId)) {
      results.criticalMissing.push(criticalId);
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
  
  console.log(`Config IDs: ${results.totalConfig}`);
  console.log(`Test IDs: ${results.totalTest}`);
  console.log(`Expected total: ${configData.totalIds || 'N/A'}`);
  
  if (results.inConfigNotInTest.length > 0) {
    console.log(`\n❌ ${results.inConfigNotInTest.length} IDs in config but NOT TESTED:`);
    results.inConfigNotInTest.slice(0, 10).forEach(id => {
      console.log(`   - ${id}`);
    });
    if (results.inConfigNotInTest.length > 10) {
      console.log(`   ... and ${results.inConfigNotInTest.length - 10} more`);
    }
  }
  
  if (results.inTestNotInConfig.length > 0) {
    console.log(`\n⚠️  ${results.inTestNotInConfig.length} IDs tested but NOT IN CONFIG:`);
    results.inTestNotInConfig.slice(0, 10).forEach(id => {
      console.log(`   - ${id}`);
    });
    if (results.inTestNotInConfig.length > 10) {
      console.log(`   ... and ${results.inTestNotInConfig.length - 10} more`);
    }
  }
  
  if (results.duplicatesInTest.length > 0) {
    console.log(`\n⚠️  ${results.duplicatesInTest.length} DUPLICATE IDs in test:`);
    results.duplicatesInTest.forEach(id => {
      console.log(`   - ${id}`);
    });
  }
  
  if (results.criticalMissing.length > 0) {
    console.log(`\n❌ ${results.criticalMissing.length} CRITICAL IDs not in config:`);
    results.criticalMissing.forEach(id => {
      console.log(`   - ${id}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (results.valid && results.criticalMissing.length === 0) {
    log('✅ All IDs validation passed!', 'success');
    return 0;
  } else {
    log('❌ IDs validation failed!', 'error');
    return 1;
  }
}

// ============================================================
// Main
// ============================================================
function main() {
  try {
    const configData = loadConfigIDs();
    const testData = loadTestIDs();
    const results = validateIDs(configData, testData);
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
