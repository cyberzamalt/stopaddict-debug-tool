// ============================================================
// debug-ui.js - Interface overlay mobile
// ============================================================
// Rôle : Affichage de l'overlay debug sur l'écran
// Dépendances : debug-logger.js
// ============================================================

console.log('[debug-ui.js] Module loaded');

import { addListener, getHistory, clearHistory, formatLog } from './debug-logger.js';

// ============================================================
// Configuration
// ============================================================
const OVERLAY_ID = 'debug-overlay';
const TOGGLE_TAPS = 5;
const TAP_TIMEOUT = 800; // ms entre chaque tap

// ============================================================
// État de l'UI
// ============================================================
let overlayElement = null;
let logsContainer = null;
let isVisible = false;
let tapCount = 0;
let lastTapTime = 0;
let unsubscribeLogger = null;

// ============================================================
// Initialisation
// ============================================================
export function initUI() {
  try {
    console.log('[debug-ui] Initializing...');
    
    // Créer l'overlay
    createOverlay();
    
    // Attacher les event listeners
    attachTapListener();
    
    // S'abonner aux logs
    unsubscribeLogger = addListener(onNewLog);
    
    // Charger l'historique existant
    loadHistory();
    
    // Vérifier si le debug était activé
    const savedState = localStorage.getItem('SA_DEBUG');
    if (savedState === 'true') {
      show();
    }
    
    console.log('[debug-ui] ✅ Initialized');
    return true;
  } catch (e) {
    console.error('[debug-ui] Init error:', e);
    return false;
  }
}

// ============================================================
// Création de l'overlay
// ============================================================
function createOverlay() {
  // Vérifier si existe déjà
  if (document.getElementById(OVERLAY_ID)) {
    console.warn('[debug-ui] Overlay already exists');
    return;
  }

  // Créer l'élément principal
  overlayElement = document.createElement('div');
  overlayElement.id = OVERLAY_ID;
  overlayElement.className = 'debug-overlay';
  
  // Styles inline (pour être sûr qu'ils s'appliquent)
  overlayElement.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    max-width: 500px;
    max-height: 70vh;
    background: rgba(17, 24, 39, 0.95);
    color: #f3f4f6;
    border: 2px solid #3b82f6;
    border-radius: 12px;
    z-index: 99999;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: none;
    flex-direction: column;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.className = 'debug-header';
  header.style.cssText = `
    background: linear-gradient(135deg, #3b82f6, #1e40af);
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1e40af;
  `;
  header.innerHTML = `
    <span style="font-weight: bold; font-size: 14px;">🔍 DEBUG STOPADDICT v1.0</span>
    <button id="debug-close-btn" style="
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      font-weight: bold;
    ">✕ Fermer</button>
  `;

  // Container des logs
  logsContainer = document.createElement('div');
  logsContainer.className = 'debug-logs';
  logsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    line-height: 1.6;
  `;

  // Footer avec boutons
  const footer = document.createElement('div');
  footer.className = 'debug-footer';
  footer.style.cssText = `
    background: #1f2937;
    padding: 10px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #374151;
  `;
  footer.innerHTML = `
    <button id="debug-copy-btn" style="
      flex: 1;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px;
      font-size: 11px;
      cursor: pointer;
      font-weight: bold;
    ">📋 Copier</button>
    <button id="debug-export-btn" style="
      flex: 1;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px;
      font-size: 11px;
      cursor: pointer;
      font-weight: bold;
    ">💾 Export TXT</button>
    <button id="debug-clear-btn" style="
      flex: 1;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px;
      font-size: 11px;
      cursor: pointer;
      font-weight: bold;
    ">🗑️ Effacer</button>
  `;

  // Assembler
  overlayElement.appendChild(header);
  overlayElement.appendChild(logsContainer);
  overlayElement.appendChild(footer);

  // Ajouter au DOM
  document.body.appendChild(overlayElement);

  // Attacher les événements des boutons
  document.getElementById('debug-close-btn').addEventListener('click', hide);
  document.getElementById('debug-copy-btn').addEventListener('click', copyToClipboard);
  document.getElementById('debug-export-btn').addEventListener('click', exportAsText);
  document.getElementById('debug-clear-btn').addEventListener('click', clearLogs);

  console.log('[debug-ui] Overlay created');
}

// ============================================================
// Affichage / Masquage
// ============================================================
export function show() {
  if (!overlayElement) {
    console.error('[debug-ui] Overlay not created');
    return;
  }
  overlayElement.style.display = 'flex';
  isVisible = true;
  localStorage.setItem('SA_DEBUG', 'true');
  console.log('[debug-ui] Overlay shown');
}

export function hide() {
  if (!overlayElement) return;
  overlayElement.style.display = 'none';
  isVisible = false;
  localStorage.setItem('SA_DEBUG', 'false');
  console.log('[debug-ui] Overlay hidden');
}

export function toggle() {
  if (isVisible) {
    hide();
  } else {
    show();
  }
}

// ============================================================
// Gestion des taps (activation)
// ============================================================
function attachTapListener() {
  const header = document.querySelector('.header') || document.querySelector('.brand');
  
  if (!header) {
    console.warn('[debug-ui] Header not found for tap detection');
    return;
  }

  header.addEventListener('click', () => {
    const now = Date.now();
    
    if (now - lastTapTime > TAP_TIMEOUT) {
      tapCount = 1;
    } else {
      tapCount++;
    }
    
    lastTapTime = now;

    if (tapCount >= TOGGLE_TAPS) {
      toggle();
      tapCount = 0;
      
      // Toast notification
      showToast(isVisible ? 'Debug activé' : 'Debug désactivé');
    }
  });

  console.log('[debug-ui] Tap listener attached (5 taps to toggle)');
}

// ============================================================
// Gestion des logs
// ============================================================
function onNewLog(logEntry) {
  if (!logsContainer) return;
  
  const logLine = document.createElement('div');
  logLine.style.cssText = `
    padding: 4px 0;
    color: ${logEntry.color};
    border-left: 3px solid ${logEntry.color};
    padding-left: 8px;
    margin-bottom: 4px;
  `;
  logLine.textContent = formatLog(logEntry);
  
  logsContainer.appendChild(logLine);
  
  // Auto-scroll vers le bas
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

function loadHistory() {
  if (!logsContainer) return;
  
  const history = getHistory();
  history.forEach(logEntry => {
    onNewLog(logEntry);
  });
  
  console.log('[debug-ui] History loaded:', history.length, 'entries');
}

function clearLogs() {
  if (!logsContainer) return;
  
  logsContainer.innerHTML = '';
  clearHistory();
  
  showToast('Logs effacés');
}

// ============================================================
// Export / Copie
// ============================================================
function copyToClipboard() {
  try {
    const text = logsContainer.innerText;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('✅ Copié dans le presse-papier'))
        .catch(err => {
          console.error('[debug-ui] Clipboard error:', err);
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  } catch (e) {
    console.error('[debug-ui] Copy error:', e);
    showToast('❌ Erreur de copie');
  }
}

function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('✅ Copié (fallback)');
  } catch (e) {
    showToast('❌ Copie impossible');
  }
  
  document.body.removeChild(textarea);
}

function exportAsText() {
  try {
    const text = logsContainer.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    showToast('✅ Rapport téléchargé');
  } catch (e) {
    console.error('[debug-ui] Export error:', e);
    showToast('❌ Erreur d\'export');
  }
}

// ============================================================
// Toast notification
// ============================================================
function showToast(message) {
  const snackbar = document.getElementById('snackbar');
  if (snackbar) {
    snackbar.textContent = message;
    snackbar.classList.add('show');
    setTimeout(() => snackbar.classList.remove('show'), 2500);
  } else {
    console.log('[debug-ui] Toast:', message);
  }
}

// ============================================================
// Cleanup
// ============================================================
export function destroy() {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
  
  if (unsubscribeLogger) {
    unsubscribeLogger();
  }
  
  console.log('[debug-ui] Destroyed');
}

// ============================================================
// Export
// ============================================================
console.log('[debug-ui.js] Ready - Functions exported:', {
  initUI: typeof initUI,
  show: typeof show,
  hide: typeof hide,
  toggle: typeof toggle,
  destroy: typeof destroy
});
