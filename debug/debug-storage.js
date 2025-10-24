// ============================================================
// debug-storage.js - Tests localStorage
// ============================================================
// Rôle : Valide l'intégrité des données localStorage
// Dépendances : debug-logger.js, config/localStorage-keys.json
// ============================================================

console.log('[debug-storage.js] Module loaded');

import { info, success, warning, error } from './debug-logger.js';

// ============================================================
// Configuration (à charger depuis JSON)
// ============================================================
const EXPECTED_KEYS = {
  'sa_daily_v1': { critical: true, type: 'object' },
  'sa_settings_v1': { critical: true, type: 'object' },
  'sa_limits_v1': { critical: false, type: 'object' },
  'sa_economy_v1': { critical: false, type: 'object' },
  'sa_warn_v1': { critical: true, type: 'object' }
};

// ============================================================
// Tests principaux
// ============================================================
export function testLocalStorage() {
  info('Testing localStorage...', 'DEBUG');
  
  const results = {
    available: false,
    keys: [],
    errors: [],
    warnings: [],
    tested: 0,
    passed: 0,
    failed: 0
  };

  try {
    // Test 1 : localStorage disponible ?
    if (typeof localStorage === 'undefined') {
      error('localStorage not available');
      return results;
    }
    
    results.available = true;
    success('localStorage available');

    // Test 2 : Vérifier chaque clé attendue
    Object.keys(EXPECTED_KEYS).forEach(key => {
      results.tested++;
      const testResult = testKey(key, EXPECTED_KEYS[key]);
      
      if (testResult.exists) {
        results.keys.push({
          key,
          ...testResult
        });
        
        if (testResult.valid) {
          results.passed++;
        } else {
          results.failed++;
          if (EXPECTED_KEYS[key].critical) {
            results.errors.push(`${key}: ${testResult.error}`);
          } else {
            results.warnings.push(`${key}: ${testResult.error}`);
          }
        }
      } else {
        results.failed++;
        if (EXPECTED_KEYS[key].critical) {
          results.errors.push(`${key}: Missing (CRITICAL)`);
          error(`${key}: MISSING (critical)`);
        } else {
          results.warnings.push(`${key}: Missing (optional)`);
          warning(`${key}: Missing (optional)`);
        }
      }
    });

    // Résumé
    if (results.failed === 0) {
      success(`localStorage: ${results.passed}/${results.tested} OK`);
    } else if (results.errors.length > 0) {
      error(`localStorage: ${results.errors.length} critical errors`);
    } else {
      warning(`localStorage: ${results.warnings.length} warnings`);
    }

    return results;

  } catch (e) {
    error('localStorage test failed', e);
    results.errors.push(e.message);
    return results;
  }
}

// ============================================================
// Test d'une clé spécifique
// ============================================================
function testKey(key, config) {
  const result = {
    exists: false,
    valid: false,
    value: null,
    error: null,
    size: 0
  };

  try {
    // Vérifier existence
    const raw = localStorage.getItem(key);
    
    if (raw === null) {
      result.error = 'Key not found';
      return result;
    }

    result.exists = true;
    result.size = raw.length;

    // Tenter de parser le JSON
    try {
      const parsed = JSON.parse(raw);
      result.value = parsed;
      
      // Vérifier le type
      const actualType = Array.isArray(parsed) ? 'array' : typeof parsed;
      
      if (config.type && actualType !== config.type) {
        result.error = `Wrong type (expected ${config.type}, got ${actualType})`;
        warning(`${key}: Wrong type`, { expected: config.type, actual: actualType });
        return result;
      }

      // Validations spécifiques par clé
      const validation = validateKeyContent(key, parsed);
      
      if (!validation.valid) {
        result.error = validation.error;
        warning(`${key}: ${validation.error}`);
        return result;
      }

      result.valid = true;
      success(`${key}: Valid (${result.size} bytes)`);

    } catch (jsonError) {
      result.error = 'Invalid JSON: ' + jsonError.message;
      error(`${key}: Invalid JSON`, jsonError);
      return result;
    }

  } catch (e) {
    result.error = 'Test error: ' + e.message;
    error(`${key}: Test error`, e);
  }

  return result;
}

// ============================================================
// Validations spécifiques par clé
// ============================================================
function validateKeyContent(key, data) {
  switch (key) {
    case 'sa_daily_v1':
      return validateDailyData(data);
    
    case 'sa_settings_v1':
      return validateSettings(data);
    
    case 'sa_limits_v1':
      return validateLimits(data);
    
    case 'sa_economy_v1':
      return validateEconomy(data);
    
    case 'sa_warn_v1':
      return validateWarn(data);
    
    default:
      return { valid: true };
  }
}

function validateDailyData(data) {
  if (typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Must be an object' };
  }

  // Vérifier que les clés sont au format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const keys = Object.keys(data);
  
  for (const key of keys) {
    if (!dateRegex.test(key)) {
      return { valid: false, error: `Invalid date key: ${key}` };
    }

    // Vérifier structure des valeurs
    const dayData = data[key];
    if (!dayData || typeof dayData !== 'object') {
      return { valid: false, error: `Invalid day data for ${key}` };
    }

    // Vérifier champs requis
    if (!('cigs' in dayData) || !('weed' in dayData) || !('alcohol' in dayData)) {
      return { valid: false, error: `Missing fields in ${key}` };
    }
  }

  return { valid: true, daysCount: keys.length };
}

function validateSettings(data) {
  if (!data.modules || typeof data.modules !== 'object') {
    return { valid: false, error: 'Missing or invalid "modules"' };
  }

  if (!data.prices || typeof data.prices !== 'object') {
    return { valid: false, error: 'Missing or invalid "prices"' };
  }

  return { valid: true };
}

function validateLimits(data) {
  if (typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Must be an object' };
  }

  // Les valeurs doivent être des nombres
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'number') {
      return { valid: false, error: `${key} must be a number` };
    }
  }

  return { valid: true };
}

function validateEconomy(data) {
  if (!('enabled' in data)) {
    return { valid: false, error: 'Missing "enabled" field' };
  }

  if (typeof data.enabled !== 'boolean') {
    return { valid: false, error: '"enabled" must be boolean' };
  }

  return { valid: true };
}

function validateWarn(data) {
  const required = ['accepted', 'hide', 'timestamp'];
  
  for (const field of required) {
    if (!(field in data)) {
      return { valid: false, error: `Missing field: ${field}` };
    }
  }

  if (typeof data.accepted !== 'boolean' || typeof data.hide !== 'boolean') {
    return { valid: false, error: 'accepted/hide must be booleans' };
  }

  return { valid: true };
}

// ============================================================
// Utilitaires
// ============================================================
export function getStorageSize() {
  let total = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += key.length + (value ? value.length : 0);
  }

  return {
    bytes: total,
    kb: (total / 1024).toFixed(2),
    mb: (total / (1024 * 1024)).toFixed(4)
  };
}

export function listAllKeys() {
  const keys = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    keys.push({
      key,
      size: value ? value.length : 0,
      isSA: key.startsWith('sa_') || key.startsWith('SA_')
    });
  }

  return keys;
}

// ============================================================
// Export
// ============================================================
console.log('[debug-storage.js] Ready - Functions exported:', {
  testLocalStorage: typeof testLocalStorage,
  getStorageSize: typeof getStorageSize,
  listAllKeys: typeof listAllKeys
});
