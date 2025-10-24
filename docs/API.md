# 📚 API Documentation - Debug Tool StopAddict

Documentation complète de l'API du Debug Tool StopAddict.

---

## 🎯 Vue d'ensemble

Le Debug Tool expose une API publique via `window.StopAddictDebug` pour contrôler le debug de manière programmatique.

---

## 📋 Table des matières

- [API Principale](#api-principale)
- [Modules](#modules)
- [Configuration](#configuration)
- [Événements](#événements)
- [Types de données](#types-de-données)

---

## 🔧 API Principale

### `window.StopAddictDebug`

Point d'entrée global de l'API.
```javascript
// Accéder à l'API
const debug = window.StopAddictDebug;
```

---

## 📦 Méthodes

### `activate()`

Active le mode debug et lance les tests.

**Signature :**
```javascript
StopAddictDebug.activate() : Promise<void>
```

**Exemple :**
```javascript
await StopAddictDebug.activate();
// Le debug est maintenant actif et les tests sont lancés
```

**Retour :**
- Promise qui se résout quand l'activation est complète

**Effets de bord :**
- Affiche l'overlay UI
- Lance tous les tests de diagnostic
- Enregistre l'état dans localStorage

---

### `deactivate()`

Désactive le mode debug.

**Signature :**
```javascript
StopAddictDebug.deactivate() : void
```

**Exemple :**
```javascript
StopAddictDebug.deactivate();
// Le debug est maintenant désactivé
```

**Effets de bord :**
- Masque l'overlay UI
- Met à jour localStorage

---

### `toggle()`

Bascule entre activé/désactivé.

**Signature :**
```javascript
StopAddictDebug.toggle() : Promise<void>
```

**Exemple :**
```javascript
await StopAddictDebug.toggle();
// Le debug change d'état
```

---

### `getState()`

Récupère l'état actuel du debug.

**Signature :**
```javascript
StopAddictDebug.getState() : DebugState
```

**Exemple :**
```javascript
const state = StopAddictDebug.getState();
console.log('Debug actif ?', state.active);
console.log('Modules chargés :', state.modules);
```

**Retour :**
```typescript
interface DebugState {
  initialized: boolean;
  active: boolean;
  modules: {
    [moduleName: string]: {
      loaded: boolean;
      error: string | null;
    }
  };
  results: TestResults;
  errors: ErrorInfo[];
  startTime: number | null;
}
```

---

### `getResults()`

Récupère les résultats des tests.

**Signature :**
```javascript
StopAddictDebug.getResults() : TestResults
```

**Exemple :**
```javascript
const results = StopAddictDebug.getResults();
console.log('Modules testés :', results.modules);
console.log('DOM testé :', results.dom);
```

**Retour :**
```typescript
interface TestResults {
  modules?: ModulesTestResult;
  dom?: DOMTestResult;
  storage?: StorageTestResult;
  events?: EventsTestResult;
  chartJS?: ChartTestResult;
}
```

---

### `runTests()`

Lance tous les tests manuellement.

**Signature :**
```javascript
StopAddictDebug.runTests() : Promise<void>
```

**Exemple :**
```javascript
await StopAddictDebug.runTests();
// Tous les tests sont relancés
```

---

## 📦 Modules

### debug-logger.js

**Exports :**

#### `initLogger()`
Initialise le système de logs.
```javascript
import { initLogger } from './debug-logger.js';
initLogger();
```

#### `log(message, level, data)`
Log un message.
```javascript
import { log } from './debug-logger.js';
log('Test message', 'INFO', { foo: 'bar' });
```

**Paramètres :**
- `message` (string) : Message à logger
- `level` (string) : Niveau (INFO, SUCCESS, WARNING, ERROR, DEBUG)
- `data` (any, optionnel) : Données supplémentaires

#### `info(message, data)`
Raccourci pour log niveau INFO.
```javascript
import { info } from './debug-logger.js';
info('Information');
```

#### `success(message, data)`
Raccourci pour log niveau SUCCESS.
```javascript
import { success } from './debug-logger.js';
success('Opération réussie');
```

#### `warning(message, data)`
Raccourci pour log niveau WARNING.
```javascript
import { warning } from './debug-logger.js';
warning('Attention');
```

#### `error(message, data)`
Raccourci pour log niveau ERROR.
```javascript
import { error } from './debug-logger.js';
error('Erreur détectée');
```

#### `getHistory()`
Récupère l'historique des logs.
```javascript
import { getHistory } from './debug-logger.js';
const history = getHistory();
console.log(`${history.length} logs enregistrés`);
```

**Retour :** Array de LogEntry

#### `clearHistory()`
Efface l'historique.
```javascript
import { clearHistory } from './debug-logger.js';
clearHistory();
```

#### `addListener(callback)`
Ajoute un écouteur sur les nouveaux logs.
```javascript
import { addListener } from './debug-logger.js';
const unsubscribe = addListener((logEntry) => {
  console.log('Nouveau log:', logEntry.message);
});

// Plus tard...
unsubscribe();
```

**Retour :** Fonction de désabonnement

---

### debug-ui.js

**Exports :**

#### `initUI()`
Initialise l'interface utilisateur.
```javascript
import { initUI } from './debug-ui.js';
initUI();
```

#### `show()`
Affiche l'overlay.
```javascript
import { show } from './debug-ui.js';
show();
```

#### `hide()`
Masque l'overlay.
```javascript
import { hide } from './debug-ui.js';
hide();
```

#### `toggle()`
Bascule l'affichage.
```javascript
import { toggle } from './debug-ui.js';
toggle();
```

---

### debug-modules.js

**Exports :**

#### `testModules()`
Teste tous les modules JS.
```javascript
import { testModules } from './debug-modules.js';
const results = await testModules();
console.log(`${results.passed}/${results.total} modules OK`);
```

**Retour :**
```typescript
interface ModulesTestResult {
  total: number;
  tested: number;
  passed: number;
  failed: number;
  criticalFailed: number;
  modules: {
    [moduleName: string]: ModuleTestInfo;
  };
  startTime: number;
  endTime: number;
  duration: number;
}
```

#### `testStateModule()`
Teste state.js en détail.
```javascript
import { testStateModule } from './debug-modules.js';
const result = await testStateModule();
console.log('Event bus fonctionne ?', result.eventBusWorks);
```

#### `testChartJS()`
Teste la disponibilité de Chart.js.
```javascript
import { testChartJS } from './debug-modules.js';
const result = testChartJS();
console.log('Chart.js version:', result.version);
```

---

### debug-dom.js

**Exports :**

#### `testDOM()`
Teste tous les IDs HTML.
```javascript
import { testDOM } from './debug-dom.js';
const results = testDOM();
console.log(`${results.passed}/${results.total} IDs trouvés`);
```

**Retour :**
```typescript
interface DOMTestResult {
  total: number;
  found: Array<{
    id: string;
    tag: string;
    classes: string;
    visible: boolean;
  }>;
  missing: string[];
  criticalMissing: string[];
  tested: number;
  passed: number;
  failed: number;
}
```

#### `testButtons()`
Teste les boutons +/-.
```javascript
import { testButtons } from './debug-dom.js';
const results = testButtons();
console.log(`${results.working.length} boutons fonctionnels`);
```

#### `testInputs()`
Teste les champs input.
```javascript
import { testInputs } from './debug-dom.js';
const results = testInputs();
```

#### `getElementInfo(id)`
Récupère les infos d'un élément.
```javascript
import { getElementInfo } from './debug-dom.js';
const info = getElementInfo('cl-plus');
console.log('Élément trouvé ?', info.found);
```

---

### debug-storage.js

**Exports :**

#### `testLocalStorage()`
Teste l'intégrité du localStorage.
```javascript
import { testLocalStorage } from './debug-storage.js';
const results = testLocalStorage();
console.log(`${results.passed}/${results.tested} clés valides`);
```

**Retour :**
```typescript
interface StorageTestResult {
  available: boolean;
  keys: Array<{
    key: string;
    exists: boolean;
    valid: boolean;
    value: any;
    error: string | null;
    size: number;
  }>;
  errors: string[];
  warnings: string[];
  tested: number;
  passed: number;
  failed: number;
}
```

#### `getStorageSize()`
Calcule la taille du localStorage.
```javascript
import { getStorageSize } from './debug-storage.js';
const size = getStorageSize();
console.log(`${size.kb} KB utilisés`);
```

**Retour :**
```typescript
interface StorageSize {
  bytes: number;
  kb: string;
  mb: string;
}
```

#### `listAllKeys()`
Liste toutes les clés.
```javascript
import { listAllKeys } from './debug-storage.js';
const keys = listAllKeys();
```

---

### debug-events.js

**Exports :**

#### `testEvents()`
Teste les événements custom.
```javascript
import { testEvents } from './debug-events.js';
const results = testEvents();
```

#### `testEventBus()`
Teste l'event bus de state.js.
```javascript
import { testEventBus } from './debug-events.js';
const result = await testEventBus();
```

---

### debug-fallbacks.js

**Exports :**

#### `repairLocalStorage()`
Répare le localStorage corrompu.
```javascript
import { repairLocalStorage } from './debug-fallbacks.js';
const result = repairLocalStorage();
console.log(`${result.repaired.length} clés réparées`);
```

#### `createMissingElements(missingIds)`
Crée les éléments DOM manquants.
```javascript
import { createMissingElements } from './debug-fallbacks.js';
const result = createMissingElements(['cl-plus', 'j-moins']);
```

#### `createChartFallback()`
Crée un stub Chart.js.
```javascript
import { createChartFallback } from './debug-fallbacks.js';
const result = createChartFallback();
```

---

## ⚙️ Configuration

### Variables d'environnement localStorage

#### `SA_DEBUG`
Active/désactive le debug.
```javascript
localStorage.setItem('SA_DEBUG', 'true');  // Activer
localStorage.setItem('SA_DEBUG', 'false'); // Désactiver
```

#### `SA_DEBUG_HISTORY`
Historique des logs (automatique).
```javascript
const history = JSON.parse(localStorage.getItem('SA_DEBUG_HISTORY'));
```

---

## 🎪 Événements

### Événements custom testés

- `sa:counts-updated` - Compteurs mis à jour
- `sa:settings-updated` - Paramètres modifiés
- `sa:range-changed` - Période changée
- `sa:route-changed` - Navigation

**Écoute :**
```javascript
document.addEventListener('sa:counts-updated', (e) => {
  console.log('Compteurs mis à jour:', e.detail);
});
```

---

## 📊 Types de données

### LogEntry
```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601
  time: string;           // HH:MM:SS
  level: string;          // INFO, SUCCESS, WARNING, ERROR, DEBUG
  message: string;
  data: any;
  icon: string;
  color: string;
}
```

### ErrorInfo
```typescript
interface ErrorInfo {
  type: string;           // ERROR ou UNHANDLED_REJECTION
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: string;         // Stack trace
  timestamp: string;      // ISO 8601
}
```

### ModuleTestInfo
```typescript
interface ModuleTestInfo {
  name: string;
  path: string;
  critical: boolean;
  loaded: boolean;
  loadTime: number;       // en ms
  exportsValid: boolean;
  exportsFound: string[];
  exportsMissing: string[];
  errors: string[];
}
```

---

## 🔗 Liens utiles

- [Troubleshooting](./TROUBLESHOOTING.md)
- [Examples](./EXAMPLES.md)
- [README principal](../README.md)

---

**Version :** 1.0.0  
**Dernière mise à jour :** 2025-10-24
