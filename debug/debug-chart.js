// ============================================================
// debug-chart.js - Tests Chart.js approfondis
// ============================================================
// Rôle : Vérifie Chart.js et la capacité à créer des graphiques
// Dépendances : debug-logger.js, Chart.js (global)
// ============================================================

console.log('[debug-chart.js] Module loaded');

import { info, success, warning, error } from './debug-logger.js';

// ============================================================
// Tests Chart.js
// ============================================================
export function testChartJS() {
  info('Testing Chart.js availability...', 'DEBUG');
  
  const result = {
    available: false,
    version: null,
    canCreateChart: false,
    canvasSupport: true,
    errors: []
  };

  try {
    // Test 1 : Chart.js disponible ?
    if (typeof window.Chart === 'undefined') {
      result.errors.push('window.Chart is undefined');
      error('Chart.js: Not available (window.Chart is undefined)');
      return result;
    }

    result.available = true;
    result.version = window.Chart.version || 'unknown';
    success(`Chart.js: Available (v${result.version})`);

    // Test 2 : Canvas supporté ?
    try {
      const testCanvas = document.createElement('canvas');
      if (!testCanvas.getContext) {
        result.canvasSupport = false;
        result.errors.push('Canvas not supported');
        error('Chart.js: Canvas not supported');
        return result;
      }
      success('Chart.js: Canvas supported');
    } catch (e) {
      result.canvasSupport = false;
      result.errors.push(`Canvas error: ${e.message}`);
      error('Chart.js: Canvas test failed', e);
      return result;
    }

    // Test 3 : Créer un graphique test
    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 100;
      testCanvas.height = 100;
      testCanvas.style.display = 'none';
      document.body.appendChild(testCanvas);

      const testChart = new window.Chart(testCanvas, {
        type: 'line',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{
            label: 'Test',
            data: [1, 2, 3]
          }]
        },
        options: {
          responsive: false,
          animation: false
        }
      });

      if (testChart) {
        result.canCreateChart = true;
        success('Chart.js: Can create charts');
        
        // Nettoyage
        testChart.destroy();
        document.body.removeChild(testCanvas);
      }
    } catch (e) {
      result.errors.push(`Chart creation error: ${e.message}`);
      error('Chart.js: Cannot create chart', e);
    }

  } catch (e) {
    result.errors.push(`Test error: ${e.message}`);
    error('Chart.js: Test error', e);
  }

  return result;
}

// ============================================================
// Test des canvas existants dans le DOM
// ============================================================
export function testChartCanvases() {
  info('Testing chart canvases in DOM...', 'DEBUG');
  
  const result = {
    canvasIds: ['chart-consommations', 'chart-cout-eco'],
    found: [],
    missing: [],
    ready: []
  };

  result.canvasIds.forEach(canvasId => {
    const canvas = document.getElementById(canvasId);
    
    if (canvas) {
      result.found.push(canvasId);
      
      if (canvas.tagName === 'CANVAS' && canvas.getContext) {
        result.ready.push(canvasId);
        success(`Canvas #${canvasId}: Ready`);
      } else {
        warning(`Canvas #${canvasId}: Found but not ready`);
      }
    } else {
      result.missing.push(canvasId);
      warning(`Canvas #${canvasId}: Missing`);
    }
  });

  return result;
}

// ============================================================
// Résumé global
// ============================================================
export function getChartSummary() {
  const chartResult = testChartJS();
  const canvasesResult = testChartCanvases();

  return {
    chart: chartResult,
    canvases: canvasesResult,
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// Export
// ============================================================
console.log('[debug-chart.js] Ready - Functions exported:', {
  testChartJS: typeof testChartJS,
  testChartCanvases: typeof testChartCanvases,
  getChartSummary: typeof getChartSummary
});
