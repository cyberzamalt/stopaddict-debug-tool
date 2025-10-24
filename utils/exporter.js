// ============================================================
// exporter.js - Export de rapports
// ============================================================
// Rôle : Exporte les rapports en différents formats
// Dépendances : reporter.js
// ============================================================

console.log('[exporter.js] Module loaded');

import { generateTextReport, generateJSONReport } from './reporter.js';

// ============================================================
// Export TXT
// ============================================================
export function exportToTXT(debugState) {
  console.log('[exporter] Exporting to TXT...');
  
  try {
    // Générer le rapport texte
    const reportText = generateTextReport(debugState);
    
    // Créer le blob
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    
    // Créer le nom du fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `debug-stopaddict-${timestamp}.txt`;
    
    // Télécharger
    downloadBlob(blob, filename);
    
    console.log('[exporter] ✅ TXT exported:', filename);
    return { success: true, filename };

  } catch (e) {
    console.error('[exporter] ❌ Export TXT failed:', e);
    return { success: false, error: e.message };
  }
}

// ============================================================
// Export JSON
// ============================================================
export function exportToJSON(debugState) {
  console.log('[exporter] Exporting to JSON...');
  
  try {
    // Générer le rapport JSON
    const reportJSON = generateJSONReport(debugState);
    
    // Créer le blob
    const blob = new Blob([reportJSON], { type: 'application/json;charset=utf-8' });
    
    // Créer le nom du fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `debug-stopaddict-${timestamp}.json`;
    
    // Télécharger
    downloadBlob(blob, filename);
    
    console.log('[exporter] ✅ JSON exported:', filename);
    return { success: true, filename };

  } catch (e) {
    console.error('[exporter] ❌ Export JSON failed:', e);
    return { success: false, error: e.message };
  }
}

// ============================================================
// Copie dans le clipboard
// ============================================================
export function copyToClipboard(debugState) {
  console.log('[exporter] Copying to clipboard...');
  
  try {
    // Générer le rapport texte
    const reportText = generateTextReport(debugState);
    
    // Méthode moderne (Clipboard API)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(reportText)
        .then(() => {
          console.log('[exporter] ✅ Copied to clipboard');
          return { success: true };
        })
        .catch(err => {
          console.warn('[exporter] Clipboard API failed, using fallback:', err);
          return fallbackCopyToClipboard(reportText);
        });
    } else {
      // Fallback pour navigateurs plus anciens
      return Promise.resolve(fallbackCopyToClipboard(reportText));
    }

  } catch (e) {
    console.error('[exporter] ❌ Copy to clipboard failed:', e);
    return Promise.resolve({ success: false, error: e.message });
  }
}

// ============================================================
// Fallback copie clipboard (anciens navigateurs)
// ============================================================
function fallbackCopyToClipboard(text) {
  console.log('[exporter] Using fallback clipboard method...');
  
  try {
    // Créer un textarea temporaire
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Exécuter la commande de copie
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      console.log('[exporter] ✅ Fallback copy successful');
      return { success: true, method: 'fallback' };
    } else {
      console.error('[exporter] ❌ Fallback copy failed');
      return { success: false, error: 'execCommand failed' };
    }

  } catch (e) {
    console.error('[exporter] ❌ Fallback copy error:', e);
    return { success: false, error: e.message };
  }
}

// ============================================================
// Sauvegarde dans localStorage
// ============================================================
export function saveToLocalStorage(debugState) {
  console.log('[exporter] Saving to localStorage...');
  
  try {
    const key = 'SA_DEBUG_LAST_REPORT';
    const report = {
      timestamp: new Date().toISOString(),
      state: debugState
    };
    
    localStorage.setItem(key, JSON.stringify(report));
    
    console.log('[exporter] ✅ Saved to localStorage');
    return { success: true, key };

  } catch (e) {
    console.error('[exporter] ❌ Save to localStorage failed:', e);
    
    // Si quota dépassé, essayer de sauvegarder une version allégée
    if (e.name === 'QuotaExceededError') {
      try {
        const lightReport = {
          timestamp: new Date().toISOString(),
          summary: {
            modules: debugState.results?.modules?.passed || 0,
            dom: debugState.results?.dom?.passed || 0,
            errors: debugState.errors?.length || 0
          }
        };
        localStorage.setItem('SA_DEBUG_LAST_REPORT', JSON.stringify(lightReport));
        console.log('[exporter] ✅ Saved light version to localStorage');
        return { success: true, key: 'SA_DEBUG_LAST_REPORT', light: true };
      } catch (e2) {
        return { success: false, error: 'Storage quota exceeded' };
      }
    }
    
    return { success: false, error: e.message };
  }
}

// ============================================================
// Utilitaire téléchargement
// ============================================================
function downloadBlob(blob, filename) {
  try {
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    // Ajouter au DOM, cliquer, puis supprimer
    document.body.appendChild(a);
    a.click();
    
    // Nettoyage
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('[exporter] Download triggered:', filename);

  } catch (e) {
    console.error('[exporter] Download failed:', e);
    throw e;
  }
}

// ============================================================
// Export complet (tous les formats)
// ============================================================
export function exportAll(debugState) {
  console.log('[exporter] Exporting all formats...');
  
  const results = {
    txt: exportToTXT(debugState),
    json: exportToJSON(debugState),
    localStorage: saveToLocalStorage(debugState)
  };
  
  console.log('[exporter] ✅ All exports completed');
  return results;
}

// ============================================================
// Export
// ============================================================
console.log('[exporter.js] Ready - Functions exported:', {
  exportToTXT: typeof exportToTXT,
  exportToJSON: typeof exportToJSON,
  copyToClipboard: typeof copyToClipboard,
  saveToLocalStorage: typeof saveToLocalStorage,
  exportAll: typeof exportAll
});
