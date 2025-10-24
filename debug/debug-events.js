// ============================================================
// debug-events.js - Tests des event listeners
// ============================================================
// Rôle : Vérifie que les événements custom sont bien émis/écoutés
// Dépendances : debug-logger.js, config/events-list.json
// ============================================================

console.log('[debug-events.js] Module loaded');

import { info, success, warning, error } from './debug-logger.js';

// ============================================================
// Configuration des événements à tester
// ============================================================
const EVENTS_TO_TEST = [
  'sa:counts-updated',
  'sa:settings-updated',
  'sa:range-changed',
  'sa:route-changed'
];

// ============================================================
// Tests principaux
// ============================================================
export function testEvents() {
  info('Testing custom events...', 'DEBUG');
  
  const results = {
    total: EVENTS_TO_TEST.length,
    tested: 0,
    working: [],
    broken: [],
    listenerCounts: {}
  };

  EVENTS_TO_TEST.forEach(eventName => {
    results.tested++;
    const eventResult = testEvent(eventName);
    
    if (eventResult.works) {
      results.working.push(eventName);
      results.listenerCounts[eventName] = eventResult.listenerCount;
    } else {
      results.broken.push(eventName);
      warning(`Event ${eventName}: Not working`);
    }
  });

  // Résumé
  if (results.broken.length === 0) {
    success(`Events: ${results.working.length}/${results.total} working`);
  } else {
    error(`Events: ${results.broken.length} not working`);
  }

  return results;
}

// ============================================================
// Test d'un événement spécifique
// ============================================================
function testEvent(eventName) {
  const result = {
    name: eventName,
    works: false,
    canEmit: false,
    canListen: false,
    listenerCount: 0,
    error: null
  };

  try {
    // Test 1 : Vérifier si on peut écouter l'événement
    let eventReceived = false;
    const testHandler = (e) => {
      eventReceived = true;
      console.log(`[debug-events] Event received: ${eventName}`, e.detail);
    };

    try {
      document.addEventListener(eventName, testHandler);
      result.canListen = true;
    } catch (e) {
      result.error = `Cannot listen: ${e.message}`;
      error(`Event ${eventName}: Cannot attach listener`, e);
      return result;
    }

    // Test 2 : Vérifier si on peut émettre l'événement
    try {
      const testEvent = new CustomEvent(eventName, {
        detail: { test: true, timestamp: Date.now() }
      });
      document.dispatchEvent(testEvent);
      result.canEmit = true;
    } catch (e) {
      result.error = `Cannot emit: ${e.message}`;
      error(`Event ${eventName}: Cannot dispatch`, e);
      document.removeEventListener(eventName, testHandler);
      return result;
    }

    // Test 3 : Vérifier si l'événement a été reçu
    if (eventReceived) {
      result.works = true;
      success(`Event ${eventName}: Works`);
    } else {
      warning(`Event ${eventName}: Not received`);
    }

    // Nettoyage
    document.removeEventListener(eventName, testHandler);

  } catch (e) {
    result.error = `Test error: ${e.message}`;
    error(`Event ${eventName}: Test failed`, e);
  }

  return result;
}

// ============================================================
// Test de l'event bus de state.js
// ============================================================
export async function testEventBus() {
  info('Testing state.js event bus...', 'DEBUG');
  
  const result = {
    available: false,
    emitWorks: false,
    onWorks: false,
    error: null
  };

  try {
    // Importer state.js
    const state = await import('../js/state.js').catch(err => {
      result.error = `Cannot import state.js: ${err.message}`;
      error('Event bus: Cannot import state.js', err);
      return null;
    });

    if (!state) {
      return result;
    }

    result.available = true;

    // Vérifier emit()
    if (typeof state.emit === 'function') {
      result.emitWorks = true;
      success('Event bus: emit() available');
    } else {
      warning('Event bus: emit() not found');
    }

    // Vérifier on()
    if (typeof state.on === 'function') {
      result.onWorks = true;
      success('Event bus: on() available');
    } else {
      warning('Event bus: on() not found');
    }

    // Test complet : émettre et recevoir
    if (result.emitWorks && result.onWorks) {
      let received = false;
      const testHandler = () => { received = true; };
      
      try {
        state.on('debug-test-event', testHandler);
        state.emit('debug-test-event', { test: true });
        
        if (received) {
          success('Event bus: Full test passed');
        } else {
          warning('Event bus: Event not received');
        }
      } catch (e) {
        result.error = `Event bus test failed: ${e.message}`;
        error('Event bus: Test failed', e);
      }
    }

  } catch (e) {
    result.error = `Test error: ${e.message}`;
    error('Event bus: Test error', e);
  }

  return result;
}

// ============================================================
// Résumé global
// ============================================================
export async function getEventsSummary() {
  const eventsResult = testEvents();
  const eventBusResult = await testEventBus();

  return {
    events: eventsResult,
    eventBus: eventBusResult,
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// Export
// ============================================================
console.log('[debug-events.js] Ready - Functions exported:', {
  testEvents: typeof testEvents,
  testEventBus: typeof testEventBus,
  getEventsSummary: typeof getEventsSummary,
  totalEvents: EVENTS_TO_TEST.length
});
