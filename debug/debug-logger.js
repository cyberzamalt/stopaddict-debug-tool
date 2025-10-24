// ============================================================
// debug-logger.js - Système de logs horodatés
// ============================================================
// Rôle : Gestion centralisée des logs avec historique
// Utilisé par : Tous les modules debug
// ============================================================

console.log('[debug-logger.js] Module loaded');

// ============================================================
// Configuration
// ============================================================
const LOG_LEVELS = {
  INFO: { icon: 'ℹ️', color: '#3b82f6', label: 'INFO' },
  SUCCESS: { icon: '✅', color: '#22c55e', label: 'SUCCESS' },
  WARNING: { icon: '⚠️', color: '#f59e0b', label: 'WARNING' },
  ERROR: { icon: '❌', color: '#ef4444', label: 'ERROR' },
  DEBUG: { icon: '🔍', color: '#8b5cf6', label: 'DEBUG' }
};

const MAX_HISTORY_SIZE = 50; // Nombre max de logs en mémoire
const STORAGE_KEY = 'SA_DEBUG_HISTORY';

// ============================================================
// État du logger
// ============================================================
let logsHistory = [];
let logListeners = [];
let isInitialized = false;

// ============================================================
// Initialisation
// ============================================================
export function initLogger() {
  if (isInitialized) {
    console.warn('[debug-logger] Already initialized');
    return;
  }

  try {
    // Charger l'historique depuis localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      logsHistory = JSON.parse(saved);
      console.log('[debug-logger] Loaded history:', logsHistory.length, 'entries');
    }
    
    isInitialized = true;
    log('Logger initialized', 'INFO');
  } catch (e) {
    console.error('[debug-logger] Init error:', e);
  }
}

// ============================================================
// Fonction principale de log
// ============================================================
export function log(message, level = 'INFO', data = null) {
  try {
    const timestamp = new Date();
    const logEntry = {
      timestamp: timestamp.toISOString(),
      time: formatTime(timestamp),
      level,
      message,
      data,
      icon: LOG_LEVELS[level]?.icon || '📝',
      color: LOG_LEVELS[level]?.color || '#6b7280'
    };

    // Ajouter au tableau d'historique
    logsHistory.push(logEntry);

    // Limiter la taille de l'historique
    if (logsHistory.length > MAX_HISTORY_SIZE) {
      logsHistory.shift(); // Supprimer le plus ancien
    }

    // Sauvegarder dans localStorage
    saveHistory();

    // Notifier tous les listeners
    notifyListeners(logEntry);

    // Log dans la console navigateur aussi
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARNING' ? 'warn' : 'log';
    console[consoleMethod](`[debug] ${logEntry.icon} ${message}`, data || '');

    return logEntry;
  } catch (e) {
    console.error('[debug-logger] Log error:', e);
    return null;
  }
}

// ============================================================
// Méthodes de log spécifiques
// ============================================================
export function info(message, data = null) {
  return log(message, 'INFO', data);
}

export function success(message, data = null) {
  return log(message, 'SUCCESS', data);
}

export function warning(message, data = null) {
  return log(message, 'WARNING', data);
}

export function error(message, data = null) {
  return log(message, 'ERROR', data);
}

export function debug(message, data = null) {
  return log(message, 'DEBUG', data);
}

// ============================================================
// Gestion de l'historique
// ============================================================
export function getHistory() {
  return [...logsHistory]; // Retourner une copie
}

export function clearHistory() {
  try {
    logsHistory = [];
    localStorage.removeItem(STORAGE_KEY);
    log('History cleared', 'INFO');
    return true;
  } catch (e) {
    console.error('[debug-logger] Clear history error:', e);
    return false;
  }
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logsHistory));
  } catch (e) {
    // Si localStorage est plein, supprimer les anciens logs
    if (e.name === 'QuotaExceededError') {
      logsHistory = logsHistory.slice(-10); // Garder seulement les 10 derniers
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logsHistory));
      } catch (e2) {
        console.error('[debug-logger] Cannot save history:', e2);
      }
    }
  }
}

// ============================================================
// Système d'écoute (pour l'UI)
// ============================================================
export function addListener(callback) {
  if (typeof callback === 'function') {
    logListeners.push(callback);
    return () => removeListener(callback); // Retourne fonction de désabonnement
  }
}

export function removeListener(callback) {
  logListeners = logListeners.filter(cb => cb !== callback);
}

function notifyListeners(logEntry) {
  logListeners.forEach(callback => {
    try {
      callback(logEntry);
    } catch (e) {
      console.error('[debug-logger] Listener error:', e);
    }
  });
}

// ============================================================
// Formattage
// ============================================================
function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function formatLog(logEntry) {
  return `[${logEntry.time}] ${logEntry.icon} ${logEntry.message}`;
}

export function formatHistoryAsText() {
  let text = '='.repeat(50) + '\n';
  text += 'DEBUG STOPADDICT - Historique des logs\n';
  text += `Généré le : ${new Date().toLocaleString('fr-FR')}\n`;
  text += '='.repeat(50) + '\n\n';

  logsHistory.forEach(log => {
    text += `[${log.time}] ${log.level} - ${log.message}\n`;
    if (log.data) {
      text += `  Data: ${JSON.stringify(log.data, null, 2)}\n`;
    }
    text += '\n';
  });

  return text;
}

// ============================================================
// Statistiques
// ============================================================
export function getStats() {
  const stats = {
    total: logsHistory.length,
    byLevel: {
      INFO: 0,
      SUCCESS: 0,
      WARNING: 0,
      ERROR: 0,
      DEBUG: 0
    }
  };

  logsHistory.forEach(log => {
    if (stats.byLevel[log.level] !== undefined) {
      stats.byLevel[log.level]++;
    }
  });

  return stats;
}

// ============================================================
// Export
// ============================================================
console.log('[debug-logger.js] Ready - Functions exported:', {
  initLogger: typeof initLogger,
  log: typeof log,
  info: typeof info,
  success: typeof success,
  warning: typeof warning,
  error: typeof error,
  debug: typeof debug,
  getHistory: typeof getHistory,
  clearHistory: typeof clearHistory,
  addListener: typeof addListener,
  formatHistoryAsText: typeof formatHistoryAsText,
  getStats: typeof getStats
});
