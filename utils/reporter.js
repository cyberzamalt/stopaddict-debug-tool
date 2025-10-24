// ============================================================
// reporter.js - Génération de rapports
// ============================================================
// Rôle : Génère des rapports détaillés des tests
// Dépendances : Aucune
// ============================================================

console.log('[reporter.js] Module loaded');

// ============================================================
// Génération rapport texte
// ============================================================
export function generateTextReport(debugState) {
  console.log('[reporter] Generating text report...');
  
  let report = '';
  
  try {
    // En-tête
    report += '='.repeat(70) + '\n';
    report += '              DEBUG STOPADDICT - RAPPORT COMPLET\n';
    report += '='.repeat(70) + '\n';
    report += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
    report += `Version: ${debugState.version || '1.0.0'}\n`;
    report += '\n';

    // Résumé exécutif
    report += '━'.repeat(70) + '\n';
    report += '  RÉSUMÉ EXÉCUTIF\n';
    report += '━'.repeat(70) + '\n';
    report += generateExecutiveSummary(debugState);
    report += '\n';

    // Section 1 : Modules JS
    if (debugState.results && debugState.results.modules) {
      report += '━'.repeat(70) + '\n';
      report += '  1. MODULES JAVASCRIPT\n';
      report += '━'.repeat(70) + '\n';
      report += generateModulesSection(debugState.results.modules);
      report += '\n';
    }

    // Section 2 : DOM
    if (debugState.results && debugState.results.dom) {
      report += '━'.repeat(70) + '\n';
      report += '  2. ÉLÉMENTS DOM (IDs HTML)\n';
      report += '━'.repeat(70) + '\n';
      report += generateDOMSection(debugState.results.dom);
      report += '\n';
    }

    // Section 3 : localStorage
    if (debugState.results && debugState.results.storage) {
      report += '━'.repeat(70) + '\n';
      report += '  3. LOCALSTORAGE\n';
      report += '━'.repeat(70) + '\n';
      report += generateStorageSection(debugState.results.storage);
      report += '\n';
    }

    // Section 4 : Events
    if (debugState.results && debugState.results.events) {
      report += '━'.repeat(70) + '\n';
      report += '  4. ÉVÉNEMENTS CUSTOM\n';
      report += '━'.repeat(70) + '\n';
      report += generateEventsSection(debugState.results.events);
      report += '\n';
    }

    // Section 5 : Chart.js
    if (debugState.results && (debugState.results.chartJS || debugState.results.chartDetailed)) {
      report += '━'.repeat(70) + '\n';
      report += '  5. CHART.JS\n';
      report += '━'.repeat(70) + '\n';
      report += generateChartSection(debugState.results.chartJS || debugState.results.chartDetailed);
      report += '\n';
    }

    // Section 6 : Erreurs
    if (debugState.errors && debugState.errors.length > 0) {
      report += '━'.repeat(70) + '\n';
      report += '  6. ERREURS JAVASCRIPT CAPTURÉES\n';
      report += '━'.repeat(70) + '\n';
      report += generateErrorsSection(debugState.errors);
      report += '\n';
    }

    // Section 7 : Recommandations
    report += '━'.repeat(70) + '\n';
    report += '  7. RECOMMANDATIONS\n';
    report += '━'.repeat(70) + '\n';
    report += generateRecommendations(debugState);
    report += '\n';

    // Pied de page
    report += '='.repeat(70) + '\n';
    report += '                    FIN DU RAPPORT\n';
    report += '='.repeat(70) + '\n';

    console.log('[reporter] ✅ Text report generated');

  } catch (e) {
    console.error('[reporter] ❌ Error generating report:', e);
    report += `\nERREUR GÉNÉRATION RAPPORT: ${e.message}\n`;
  }

  return report;
}

// ============================================================
// Résumé exécutif
// ============================================================
function generateExecutiveSummary(debugState) {
  let summary = '';
  
  const results = debugState.results || {};
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let criticalFailures = 0;

  // Compter les résultats
  if (results.modules) {
    totalTests += results.modules.total || 0;
    passedTests += results.modules.passed || 0;
    failedTests += results.modules.failed || 0;
    criticalFailures += results.modules.criticalFailed || 0;
  }

  if (results.dom) {
    totalTests += results.dom.total || 0;
    passedTests += results.dom.passed || 0;
    failedTests += results.dom.failed || 0;
    if (results.dom.criticalMissing) {
      criticalFailures += results.dom.criticalMissing.length;
    }
  }

  if (results.storage) {
    totalTests += results.storage.tested || 0;
    passedTests += results.storage.passed || 0;
    failedTests += results.storage.failed || 0;
    if (results.storage.errors) {
      criticalFailures += results.storage.errors.length;
    }
  }

  summary += `Total tests exécutés : ${totalTests}\n`;
  summary += `Tests réussis : ${passedTests} (${Math.round(passedTests/totalTests*100)}%)\n`;
  summary += `Tests échoués : ${failedTests}\n`;
  summary += `Défaillances critiques : ${criticalFailures}\n`;
  summary += '\n';

  if (criticalFailures === 0) {
    summary += '✅ STATUS : AUCUNE ERREUR CRITIQUE\n';
  } else if (criticalFailures <= 3) {
    summary += '⚠️  STATUS : QUELQUES PROBLÈMES À CORRIGER\n';
  } else {
    summary += '❌ STATUS : CORRECTIONS URGENTES NÉCESSAIRES\n';
  }

  return summary;
}

// ============================================================
// Section Modules
// ============================================================
function generateModulesSection(modulesResult) {
  let section = '';
  
  section += `Total modules testés : ${modulesResult.total || 0}\n`;
  section += `Modules OK : ${modulesResult.passed || 0}\n`;
  section += `Modules en erreur : ${modulesResult.failed || 0}\n`;
  section += `Défaillances critiques : ${modulesResult.criticalFailed || 0}\n`;
  section += `Durée : ${modulesResult.duration || 0}ms\n`;
  section += '\n';

  if (modulesResult.modules) {
    section += 'Détails par module :\n';
    section += '─'.repeat(70) + '\n';
    
    Object.entries(modulesResult.modules).forEach(([moduleName, moduleInfo]) => {
      const status = moduleInfo.loaded && moduleInfo.exportsValid ? '✅' : '❌';
      section += `${status} ${moduleName}\n`;
      
      if (moduleInfo.loaded) {
        section += `   Chargé en ${moduleInfo.loadTime || 0}ms\n`;
        if (moduleInfo.exportsFound && moduleInfo.exportsFound.length > 0) {
          section += `   Exports trouvés : ${moduleInfo.exportsFound.length}\n`;
        }
        if (moduleInfo.exportsMissing && moduleInfo.exportsMissing.length > 0) {
          section += `   ⚠️  Exports manquants : ${moduleInfo.exportsMissing.join(', ')}\n`;
        }
      } else {
        section += `   ❌ Erreur : ${moduleInfo.errors ? moduleInfo.errors[0] : 'Non chargé'}\n`;
      }
      section += '\n';
    });
  }

  return section;
}

// ============================================================
// Section DOM
// ============================================================
function generateDOMSection(domResult) {
  let section = '';
  
  section += `Total IDs testés : ${domResult.total || 0}\n`;
  section += `IDs trouvés : ${domResult.passed || 0}\n`;
  section += `IDs manquants : ${domResult.failed || 0}\n`;
  section += '\n';

  if (domResult.criticalMissing && domResult.criticalMissing.length > 0) {
    section += '❌ IDs CRITIQUES MANQUANTS :\n';
    domResult.criticalMissing.forEach(id => {
      section += `   - #${id}\n`;
    });
    section += '\n';
  }

  if (domResult.missing && domResult.missing.length > 0 && domResult.missing.length <= 20) {
    section += '⚠️  Tous les IDs manquants :\n';
    domResult.missing.forEach(id => {
      section += `   - #${id}\n`;
    });
    section += '\n';
  } else if (domResult.missing && domResult.missing.length > 20) {
    section += `⚠️  ${domResult.missing.length} IDs manquants (liste trop longue)\n\n`;
  }

  return section;
}

// ============================================================
// Section Storage
// ============================================================
function generateStorageSection(storageResult) {
  let section = '';
  
  section += `localStorage disponible : ${storageResult.available ? 'Oui' : 'Non'}\n`;
  section += `Clés testées : ${storageResult.tested || 0}\n`;
  section += `Clés valides : ${storageResult.passed || 0}\n`;
  section += `Clés en erreur : ${storageResult.failed || 0}\n`;
  section += '\n';

  if (storageResult.errors && storageResult.errors.length > 0) {
    section += '❌ ERREURS :\n';
    storageResult.errors.forEach(error => {
      section += `   - ${error}\n`;
    });
    section += '\n';
  }

  if (storageResult.warnings && storageResult.warnings.length > 0) {
    section += '⚠️  AVERTISSEMENTS :\n';
    storageResult.warnings.forEach(warning => {
      section += `   - ${warning}\n`;
    });
    section += '\n';
  }

  return section;
}

// ============================================================
// Section Events
// ============================================================
function generateEventsSection(eventsResult) {
  let section = '';
  
  section += `Événements testés : ${eventsResult.total || 0}\n`;
  section += `Événements fonctionnels : ${eventsResult.working ? eventsResult.working.length : 0}\n`;
  section += `Événements défaillants : ${eventsResult.broken ? eventsResult.broken.length : 0}\n`;
  section += '\n';

  if (eventsResult.broken && eventsResult.broken.length > 0) {
    section += '❌ ÉVÉNEMENTS NON FONCTIONNELS :\n';
    eventsResult.broken.forEach(event => {
      section += `   - ${event}\n`;
    });
    section += '\n';
  }

  return section;
}

// ============================================================
// Section Chart.js
// ============================================================
function generateChartSection(chartResult) {
  let section = '';
  
  section += `Chart.js disponible : ${chartResult.available ? 'Oui' : 'Non'}\n`;
  if (chartResult.version) {
    section += `Version : ${chartResult.version}\n`;
  }
  section += `Peut créer des graphiques : ${chartResult.canCreateChart ? 'Oui' : 'Non'}\n`;
  section += `Support Canvas : ${chartResult.canvasSupport !== false ? 'Oui' : 'Non'}\n`;
  section += '\n';

  if (chartResult.errors && chartResult.errors.length > 0) {
    section += '❌ ERREURS :\n';
    chartResult.errors.forEach(error => {
      section += `   - ${error}\n`;
    });
    section += '\n';
  }

  return section;
}

// ============================================================
// Section Erreurs
// ============================================================
function generateErrorsSection(errors) {
  let section = '';
  
  section += `Total erreurs capturées : ${errors.length}\n\n`;

  errors.slice(0, 10).forEach((error, index) => {
    section += `Erreur #${index + 1} :\n`;
    section += `   Type : ${error.type}\n`;
    section += `   Message : ${error.message}\n`;
    if (error.filename) {
      section += `   Fichier : ${error.filename}:${error.lineno}\n`;
    }
    section += `   Timestamp : ${error.timestamp}\n`;
    section += '\n';
  });

  if (errors.length > 10) {
    section += `... et ${errors.length - 10} autres erreurs\n\n`;
  }

  return section;
}

// ============================================================
// Recommandations
// ============================================================
function generateRecommendations(debugState) {
  let section = '';
  const recommendations = [];

  const results = debugState.results || {};

  // Recommandations modules
  if (results.modules && results.modules.criticalFailed > 0) {
    recommendations.push('🔴 URGENT : Corriger les modules critiques défaillants');
  }

  // Recommandations DOM
  if (results.dom && results.dom.criticalMissing && results.dom.criticalMissing.length > 0) {
    recommendations.push('🔴 URGENT : Ajouter les IDs critiques manquants dans index.html');
  }

  // Recommandations storage
  if (results.storage && results.storage.errors && results.storage.errors.length > 0) {
    recommendations.push('🟡 Réparer les données localStorage corrompues');
  }

  // Recommandations Chart.js
  if (results.chartJS && !results.chartJS.available) {
    recommendations.push('🟡 Vérifier le chargement de Chart.js dans index.html');
  }

  // Recommandations erreurs
  if (debugState.errors && debugState.errors.length > 0) {
    recommendations.push('🟡 Corriger les erreurs JavaScript capturées');
  }

  if (recommendations.length === 0) {
    section += '✅ Aucune recommandation - Tout fonctionne correctement !\n';
  } else {
    recommendations.forEach((rec, index) => {
      section += `${index + 1}. ${rec}\n`;
    });
  }

  return section;
}

// ============================================================
// Génération rapport JSON
// ============================================================
export function generateJSONReport(debugState) {
  console.log('[reporter] Generating JSON report...');
  
  try {
    const report = {
      version: debugState.version || '1.0.0',
      timestamp: new Date().toISOString(),
      results: debugState.results || {},
      errors: debugState.errors || [],
      modules: debugState.modules || {}
    };

    console.log('[reporter] ✅ JSON report generated');
    return JSON.stringify(report, null, 2);

  } catch (e) {
    console.error('[reporter] ❌ Error generating JSON report:', e);
    return JSON.stringify({ error: e.message }, null, 2);
  }
}

// ============================================================
// Export
// ============================================================
console.log('[reporter.js] Ready - Functions exported:', {
  generateTextReport: typeof generateTextReport,
  generateJSONReport: typeof generateJSONReport
});
