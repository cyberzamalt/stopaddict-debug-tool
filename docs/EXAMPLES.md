# 📚 Examples - Debug Tool StopAddict

Exemples d'utilisation pratiques du Debug Tool.

---

## 📋 Table des matières

- [Exemples de base](#exemples-de-base)
- [Utilisation avancée](#utilisation-avancée)
- [Intégration](#intégration)
- [Automatisation](#automatisation)
- [Cas d'usage réels](#cas-dusage-réels)

---

## 🎯 Exemples de base

### Exemple 1 : Activation simple
```javascript
// Activer le debug
await StopAddictDebug.activate();

// Vérifier l'état
const state = StopAddictDebug.getState();
console.log('Debug actif ?', state.active);
```

---

### Exemple 2 : Récupérer les résultats
```javascript
// Activer et récupérer les résultats
await StopAddictDebug.activate();

const results = StopAddictDebug.getResults();

// Afficher les résultats modules
console.log('Modules testés :', results.modules.total);
console.log('Modules OK :', results.modules.passed);
console.log('Modules KO :', results.modules.failed);

// Afficher les résultats DOM
console.log('IDs trouvés :', results.dom.passed);
console.log('IDs manquants :', results.dom.missing);
```

---

### Exemple 3 : Logs personnalisés
```javascript
import { info, success, warning, error } from './debug/debug-logger.js';

// Différents niveaux de logs
info('Information générale');
success('Opération réussie !');
warning('Attention, vérifier ceci');
error('Erreur détectée');

// Avec données supplémentaires
info('Utilisateur connecté', { userId: 123, name: 'Jean' });
```

---

### Exemple 4 : Tester un module spécifique
```javascript
import { testStateModule } from './debug/debug-modules.js';

// Tester state.js en détail
const result = await testStateModule();

console.log('Module chargé ?', result.loaded);
console.log('Event bus fonctionne ?', result.eventBusWorks);
console.log('Fonctions testées :', result.functionsWork);
```

---

### Exemple 5 : Vérifier un élément DOM
```javascript
import { getElementInfo } from './debug/debug-dom.js';

// Vérifier si un élément existe
const info = getElementInfo('cl-plus');

if (info.found) {
  console.log('✅ Élément trouvé');
  console.log('Tag :', info.tag);
  console.log('Classes :', info.classes);
  console.log('Visible ?', info.visible);
} else {
  console.log('❌ Élément non trouvé');
}
```

---

## 🚀 Utilisation avancée

### Exemple 6 : Écouter les nouveaux logs
```javascript
import { addListener } from './debug/debug-logger.js';

// Ajouter un listener personnalisé
const unsubscribe = addListener((logEntry) => {
  // Afficher dans une interface custom
  console.log(`[${logEntry.time}] ${logEntry.level}: ${logEntry.message}`);
  
  // Envoyer à un serveur de monitoring
  if (logEntry.level === 'ERROR') {
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify(logEntry)
    });
  }
});

// Plus tard, se désabonner
unsubscribe();
```

---

### Exemple 7 : Tests conditionnels
```javascript
// Tester uniquement si on est en développement
if (window.location.hostname === 'localhost') {
  await StopAddictDebug.activate();
}

// Ou selon un paramètre URL
const params = new URLSearchParams(window.location.search);
if (params.has('debug')) {
  await StopAddictDebug.activate();
}
```

---

### Exemple 8 : Réparation automatique
```javascript
import { repairLocalStorage, createMissingElements } from './debug/debug-fallbacks.js';

// Tester et réparer automatiquement
await StopAddictDebug.runTests();
const results = StopAddictDebug.getResults();

// Réparer localStorage si corrompu
if (results.storage && results.storage.errors.length > 0) {
  console.log('🔧 Réparation localStorage...');
  const repairResult = repairLocalStorage();
  console.log(`✅ ${repairResult.repaired.length} clés réparées`);
}

// Créer les IDs critiques manquants
if (results.dom && results.dom.criticalMissing.length > 0) {
  console.log('🔧 Création IDs manquants...');
  const createResult = createMissingElements(results.dom.criticalMissing);
  console.log(`✅ ${createResult.created.length} éléments créés`);
}
```

---

### Exemple 9 : Export programmé
```javascript
import { exportToTXT, exportToJSON } from './utils/exporter.js';

// Exporter automatiquement après les tests
await StopAddictDebug.runTests();
const state = StopAddictDebug.getState();

// Export TXT
exportToTXT(state);

// Export JSON
exportToJSON(state);

// Ou copier dans le clipboard
import { copyToClipboard } from './utils/exporter.js';
const result = await copyToClipboard(state);
if (result.success) {
  console.log('✅ Rapport copié dans le clipboard');
}
```

---

### Exemple 10 : Rapport personnalisé
```javascript
import { generateTextReport } from './utils/reporter.js';

// Générer un rapport custom
const state = StopAddictDebug.getState();
const report = generateTextReport(state);

// Afficher dans la console
console.log(report);

// Envoyer par email
const mailto = `mailto:dev@example.com?subject=Debug Report&body=${encodeURIComponent(report)}`;
window.location.href = mailto;
```

---

## 🔌 Intégration

### Exemple 11 : Intégration avec app.js
```javascript
// Dans app.js, après l'initialisation

async function boot() {
  try {
    // Initialisation normale de l'app
    initModals();
    initCounters();
    initCharts();
    
    // Si mode debug actif, lancer les tests
    if (localStorage.getItem('SA_DEBUG') === 'true') {
      console.log('🔍 Mode debug actif');
      await StopAddictDebug.runTests();
    }
    
  } catch (e) {
    console.error('❌ Erreur au boot:', e);
    
    // Activer le debug automatiquement en cas d'erreur
    await StopAddictDebug.activate();
  }
}
```

---

### Exemple 12 : Bouton debug personnalisé
```html
<!-- Ajouter un bouton dans l'UI -->
<button id="toggle-debug" style="position: fixed; bottom: 10px; right: 10px;">
  🔍 Debug
</button>

<script>
document.getElementById('toggle-debug').addEventListener('click', async () => {
  await StopAddictDebug.toggle();
});
</script>
```

---

### Exemple 13 : Debug sur erreur
```javascript
// Activer automatiquement le debug en cas d'erreur
window.addEventListener('error', async (event) => {
  console.error('❌ Erreur détectée:', event.message);
  
  // Activer le debug pour investigation
  if (!StopAddictDebug.getState().active) {
    await StopAddictDebug.activate();
  }
});

// Idem pour les promesses rejetées
window.addEventListener('unhandledrejection', async (event) => {
  console.error('❌ Promise rejetée:', event.reason);
  
  if (!StopAddictDebug.getState().active) {
    await StopAddictDebug.activate();
  }
});
```

---

## 🤖 Automatisation

### Exemple 14 : Tests automatiques au démarrage
```javascript
// Tests automatiques en environnement de dev
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', async () => {
    console.log('🧪 Lancement tests automatiques...');
    await StopAddictDebug.activate();
    
    const results = StopAddictDebug.getResults();
    
    // Vérifier si tout est OK
    const allOK = (
      results.modules?.failed === 0 &&
      results.dom?.criticalMissing?.length === 0 &&
      results.storage?.errors?.length === 0
    );
    
    if (allOK) {
      console.log('✅ Tous les tests passent');
      StopAddictDebug.deactivate();
    } else {
      console.error('❌ Des tests échouent, debug reste actif');
    }
  });
}
```

---

### Exemple 15 : Monitoring continu
```javascript
// Vérifier périodiquement l'état de l'app
setInterval(async () => {
  // Re-tester tous les modules
  const results = await StopAddictDebug.runTests();
  
  // Envoyer les métriques à un serveur
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: Date.now(),
      modules: results.modules?.passed || 0,
      errors: StopAddictDebug.getState().errors.length
    })
  });
}, 60000); // Toutes les 60 secondes
```

---

### Exemple 16 : Export planifié
```javascript
import { saveToLocalStorage } from './utils/exporter.js';

// Sauvegarder automatiquement toutes les 5 minutes
setInterval(() => {
  const state = StopAddictDebug.getState();
  const result = saveToLocalStorage(state);
  
  if (result.success) {
    console.log('💾 État debug sauvegardé');
  }
}, 5 * 60 * 1000);
```

---

## 🎬 Cas d'usage réels

### Cas 1 : Bug après mise à jour

**Scénario :** Après une mise à jour, les boutons +/- ne fonctionnent plus.
```javascript
// 1. Activer le debug
await StopAddictDebug.activate();

// 2. Vérifier les résultats
const results = StopAddictDebug.getResults();

// 3. Analyser les boutons
console.log('Boutons testés :', results.buttons);
// Résultat : { broken: [{ id: 'cl-plus', reason: 'No event listeners' }] }

// 4. Identifier le problème
// → Les event listeners ne sont pas attachés

// 5. Vérifier counters.js
const moduleResult = results.modules.modules['counters.js'];
console.log('counters.js chargé ?', moduleResult.loaded);
// → true

// 6. Conclusion : counters.js se charge mais n'attache pas les listeners
// → Vérifier initCounters() dans app.js
```

---

### Cas 2 : LocalStorage corrompu

**Scénario :** L'app ne démarre pas, données localStorage corrompues.
```javascript
// 1. Activer le debug
await StopAddictDebug.activate();

// 2. Vérifier localStorage
const results = StopAddictDebug.getResults();
console.log('Erreurs storage :', results.storage.errors);
// → ["sa_limits_v1: JSON invalide"]

// 3. Réparer automatiquement
import { repairLocalStorage } from './debug/debug-fallbacks.js';
const repairResult = repairLocalStorage();
console.log('Réparations :', repairResult.repaired);
// → ["sa_limits_v1"]

// 4. Recharger l'app
location.reload();
```

---

### Cas 3 : IDs manquants après refonte

**Scénario :** Après refonte du HTML, certains IDs ont changé.
```javascript
// 1. Lancer les tests
await StopAddictDebug.runTests();

// 2. Lister les IDs manquants
const results = StopAddictDebug.getResults();
console.log('IDs manquants :', results.dom.missing);
// → ["heure-actuelle", "note-cigs", "note-weed"]

// 3. Vérifier si critiques
console.log('Critiques :', results.dom.criticalMissing);
// → ["heure-actuelle"]

// 4. Créer temporairement
import { createMissingElements } from './debug/debug-fallbacks.js';
createMissingElements(['heure-actuelle']);

// 5. Corriger définitivement dans index.html
// Ajouter <div id="heure-actuelle"></div>
```

---

### Cas 4 : Performance dégradée

**Scénario :** L'app est lente, identifier le problème.
```javascript
// 1. Activer le debug avec métriques
await StopAddictDebug.activate();

// 2. Analyser les temps de chargement
const results = StopAddictDebug.getResults();
Object.entries(results.modules.modules).forEach(([name, info]) => {
  if (info.loadTime > 200) {
    console.warn(`⚠️  ${name} : ${info.loadTime}ms (lent)`);
  }
});
// → "charts.js : 450ms (lent)"

// 3. Identifier la cause
// → charts.js prend trop de temps
// → Vérifier si Chart.js est trop lourd

// 4. Solution : lazy-load Chart.js
```

---

### Cas 5 : Déploiement production

**Scénario :** Avant de déployer, vérifier que tout fonctionne.
```javascript
// Script de vérification pre-deploy
async function preDeploy() {
  console.log('🔍 Vérification pre-deploy...');
  
  await StopAddictDebug.activate();
  const results = StopAddictDebug.getResults();
  
  const checks = [
    {
      name: 'Modules critiques',
      pass: results.modules?.criticalFailed === 0
    },
    {
      name: 'IDs critiques',
      pass: results.dom?.criticalMissing?.length === 0
    },
    {
      name: 'LocalStorage',
      pass: results.storage?.errors?.length === 0
    },
    {
      name: 'Chart.js',
      pass: results.chartJS?.available === true
    }
  ];
  
  const allPass = checks.every(c => c.pass);
  
  if (allPass) {
    console.log('✅ Tous les checks passent, OK pour déployer');
    return true;
  } else {
    console.error('❌ Checks échoués :');
    checks.filter(c => !c.pass).forEach(c => {
      console.error(`  - ${c.name}`);
    });
    return false;
  }
}

// Lancer avant deploy
preDeploy().then(ok => {
  if (ok) {
    // Continuer le déploiement
  } else {
    // Bloquer le déploiement
    throw new Error('Pre-deploy checks failed');
  }
});
```

---

## 📚 Ressources

- [API Documentation](./API.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [README principal](../README.md)

---

**Version :** 1.0.0  
**Dernière mise à jour :** 2025-10-24
```

---

## ✅ PHASE 5 TERMINÉE !

### 📦 Les 3 fichiers de documentation créés :

1. ✅ **docs/API.md** (~600 lignes) - Documentation API complète
2. ✅ **docs/TROUBLESHOOTING.md** (~500 lignes) - Guide de dépannage
3. ✅ **docs/EXAMPLES.md** (~450 lignes) - Exemples d'utilisation

---

## 🎯 RÉCAPITULATIF TOTAL FINAL

### ✅ Phase 1 - Fichiers obligatoires : 13 fichiers
### ✅ Phase 2 - Fichiers importants : 4 fichiers
### ✅ Phase 3 - Utilitaires : 3 fichiers
### ✅ Phase 4 - Scripts de vérification : 3 fichiers
### ✅ Phase 5 - Documentation : 3 fichiers

---

## 🎉 PROJET COMPLET !

**TOTAL : 26 FICHIERS CRÉÉS (~6000-7000 lignes de code)**

---

## 📂 STRUCTURE FINALE
```
stopaddict-debug-tool/
├── README.md ✅
├── INSTALL.md ✅
├── CHANGELOG.md ✅
├── LICENSE ✅
├── .gitignore ✅
├── debug/
│   ├── debug.js ✅ (principal)
│   ├── debug-logger.js ✅
│   ├── debug-ui.js ✅
│   ├── debug-modules.js ✅
│   ├── debug-dom.js ✅
│   ├── debug-storage.js ✅
│   ├── debug-events.js ✅
│   ├── debug-chart.js ✅
│   └── debug-fallbacks.js ✅
├── config/
│   ├── ids-list.json ✅
│   ├── modules-list.json ✅
│   ├── events-list.json ✅
│   └── localStorage-keys.json ✅
├── utils/
│   ├── validator.js ✅
│   ├── reporter.js ✅
│   └── exporter.js ✅
├── scripts/
│   ├── check-concordance.js ✅
│   ├── validate-ids.js ✅
│   └── validate-modules.js ✅
└── docs/
    ├── API.md ✅
    ├── TROUBLESHOOTING.md ✅
    └── EXAMPLES.md ✅
