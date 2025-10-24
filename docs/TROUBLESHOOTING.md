# 🔧 Troubleshooting - Debug Tool StopAddict

Guide de dépannage complet pour résoudre tous les problèmes courants du Debug Tool.

---

## 📋 Table des matières

- [Problèmes d'installation](#problèmes-dinstallation)
- [Problèmes d'activation](#problèmes-dactivation)
- [Problèmes d'affichage](#problèmes-daffichage)
- [Erreurs de chargement](#erreurs-de-chargement)
- [Problèmes de tests](#problèmes-de-tests)
- [Problèmes d'export](#problèmes-dexport)
- [Problèmes de performance](#problèmes-de-performance)
- [Problèmes spécifiques mobile](#problèmes-spécifiques-mobile)
- [Problèmes critiques](#problèmes-critiques)
- [Réinitialisation complète](#réinitialisation-complète)
- [Obtenir de l'aide](#obtenir-de-laide)

---

## 🚨 Problèmes d'installation

### ❌ Problème 1 : Le script debug.js ne se charge pas

**Symptômes :**
- Aucun message `[debug.js]` dans la console
- `window.StopAddictDebug` est undefined
- Pas d'overlay qui apparaît

**Diagnostic :**
```javascript
// Dans la console (F12)
console.log(window.StopAddictDebug);
// Si undefined → debug.js n'est pas chargé
```

**Solutions :**

#### Solution 1.1 : Vérifier le chemin du fichier
```html
<!-- ✅ CORRECT -->
<script src="./js/debug.js"></script>

<!-- ❌ INCORRECT - Chemin absolu -->
<script src="/debug.js"></script>

<!-- ❌ INCORRECT - Pas de ./  -->
<script src="js/debug.js"></script>

<!-- ❌ INCORRECT - Mauvais dossier -->
<script src="./debug.js"></script>
```

#### Solution 1.2 : Vérifier l'ordre de chargement
```html
<!-- ✅ CORRECT : debug.js EN PREMIER -->
<script src="./js/debug.js"></script>
<script src="./js/vendor/chart.umd.min.js"></script>
<script type="module" src="./js/app.js"></script>

<!-- ❌ INCORRECT : debug.js APRÈS app.js -->
<script type="module" src="./js/app.js"></script>
<script src="./js/debug.js"></script>
```

**Pourquoi c'est important :**
- debug.js doit capturer les erreurs dès le début
- Si chargé après, certaines erreurs ne seront pas capturées

#### Solution 1.3 : Vérifier que le fichier existe
```bash
# Dans le terminal, vérifier la structure
ls -la web/js/
# Devrait afficher debug.js

# Ou via Node.js
node -e "console.log(require('fs').existsSync('./web/js/debug.js'))"
# Devrait afficher true
```

#### Solution 1.4 : Vérifier les erreurs de syntaxe
```javascript
// F12 → Console → Chercher des erreurs rouges
// Si vous voyez : "Unexpected token" ou "Syntax error"
// → Le fichier debug.js est corrompu
// → Re-téléchargez-le depuis GitHub
```

---

### ❌ Problème 2 : Erreur "Module not found" ou "MIME type"

**Symptômes :**
```
Failed to load module script: Expected a JavaScript module script 
but the server responded with a MIME type of "text/html"
```

**Cause :**
- Vous ouvrez le fichier directement avec `file://`
- Les modules ES6 nécessitent un serveur HTTP

**Solutions :**

#### Solution 2.1 : Utiliser un serveur HTTP local
```bash
# Méthode 1 : Python (recommandé)
cd /chemin/vers/stopaddict
python -m http.server 8000
# Puis ouvrir : http://localhost:8000

# Méthode 2 : Python 2
python -m SimpleHTTPServer 8000

# Méthode 3 : Node.js
npx serve
# Ou si http-server installé
http-server -p 8000

# Méthode 4 : PHP
php -S localhost:8000

# Méthode 5 : Extension VS Code
# Installer "Live Server" dans VS Code
# Clic droit sur index.html → Open with Live Server
```

#### Solution 2.2 : Configuration Apache/Nginx

Si vous utilisez un vrai serveur :
```apache
# Apache - .htaccess
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/json .json
</IfModule>
```
```nginx
# Nginx - nginx.conf
location ~ \.js$ {
  add_header Content-Type application/javascript;
}
```

---

### ❌ Problème 3 : Erreur "Cannot find module './debug-logger.js'"

**Symptômes :**
```
Uncaught (in promise) Error: Cannot find module './debug-logger.js'
```

**Diagnostic :**
```bash
# Vérifier que TOUS les fichiers existent
ls -la debug/
# Devrait montrer :
# debug.js
# debug-logger.js
# debug-ui.js
# debug-modules.js
# debug-dom.js
# debug-storage.js
# debug-events.js
# debug-chart.js
# debug-fallbacks.js
```

**Solutions :**

#### Solution 3.1 : Vérifier les fichiers manquants
```javascript
// Script de vérification rapide
const requiredFiles = [
  'debug/debug.js',
  'debug/debug-logger.js',
  'debug/debug-ui.js',
  'debug/debug-modules.js',
  'debug/debug-dom.js',
  'debug/debug-storage.js',
  'debug/debug-events.js',
  'debug/debug-chart.js',
  'debug/debug-fallbacks.js'
];

requiredFiles.forEach(file => {
  fetch(file)
    .then(r => console.log(`✅ ${file}`))
    .catch(e => console.error(`❌ ${file} MANQUANT`));
});
```

#### Solution 3.2 : Re-télécharger les fichiers manquants

- Aller sur le repository GitHub
- Télécharger le fichier manquant
- Le placer dans `debug/`

---

### ❌ Problème 4 : Extensions de fichiers incorrectes

**Symptômes :**
- Fichiers téléchargés avec extension `.txt`
- Erreurs de chargement

**Solution :**
```bash
# Sur Windows, vérifier les extensions cachées
# Panneau de configuration → Options des dossiers
# → Affichage → Décocher "Masquer les extensions"

# Renommer si nécessaire
mv debug.js.txt debug.js
mv debug-logger.js.txt debug-logger.js
# etc.
```

---

## 🔓 Problèmes d'activation

### ❌ Problème 5 : Les 5 taps ne fonctionnent pas

**Symptômes :**
- Vous tapez 5 fois sur le header
- Rien ne se passe
- Aucun overlay n'apparaît

**Diagnostic :**
```javascript
// Vérifier si debug.js est chargé
console.log(typeof window.StopAddictDebug);
// Doit afficher 'object', pas 'undefined'

// Vérifier le header
console.log(document.querySelector('.header'));
// Doit trouver un élément, pas null
```

**Solutions :**

#### Solution 5.1 : Vérifier le sélecteur du header
```javascript
// Le debug cherche :
const header = document.querySelector('.header') || document.querySelector('.brand');

// Vérifier quel sélecteur correspond à votre HTML
console.log('Header avec .header ?', document.querySelector('.header'));
console.log('Header avec .brand ?', document.querySelector('.brand'));

// Si aucun ne correspond, identifier votre header :
console.log('Tous les headers :', document.querySelectorAll('header'));
```

#### Solution 5.2 : Modifier le sélecteur dans debug-ui.js
```javascript
// Ouvrir debug-ui.js
// Chercher la fonction attachTapListener()
// Modifier la ligne :
const header = document.querySelector('#votre-header-id');
// Ou
const header = document.querySelector('.votre-classe-header');
```

#### Solution 5.3 : Réduire le nombre de taps
```javascript
// Dans debug-ui.js
// Ligne ~15
const TOGGLE_TAPS = 3; // Au lieu de 5
```

#### Solution 5.4 : Augmenter le délai entre taps
```javascript
// Dans debug-ui.js
// Ligne ~16
const TAP_TIMEOUT = 1500; // Au lieu de 800 (en ms)
```

#### Solution 5.5 : Activation manuelle via console
```javascript
// F12 → Console
await StopAddictDebug.activate();
// Devrait activer immédiatement
```

#### Solution 5.6 : Activation via localStorage
```javascript
// F12 → Console
localStorage.setItem('SA_DEBUG', 'true');
location.reload();
// Le debug sera actif au chargement
```

---

### ❌ Problème 6 : Le debug s'active puis se désactive immédiatement

**Symptômes :**
- L'overlay apparaît une fraction de seconde
- Puis disparaît
- Le localStorage est réinitialisé

**Diagnostic :**
```javascript
// Vérifier le localStorage après activation
console.log(localStorage.getItem('SA_DEBUG'));
// Doit être 'true', pas 'false' ou null

// Vérifier s'il y a un conflit
window.addEventListener('storage', (e) => {
  console.log('Storage modifié :', e.key, e.newValue);
});
```

**Solutions :**

#### Solution 6.1 : Forcer la persistance
```javascript
// Forcer l'activation permanente
localStorage.setItem('SA_DEBUG', 'true');

// Empêcher la désactivation
Object.defineProperty(localStorage, 'SA_DEBUG', {
  value: 'true',
  writable: false
});

location.reload();
```

#### Solution 6.2 : Vérifier les conflits avec app.js
```javascript
// Dans app.js, chercher :
localStorage.clear(); // ← Supprime tout, y compris SA_DEBUG
localStorage.removeItem('SA_DEBUG'); // ← Désactive le debug

// Si trouvé, commenter ou modifier
```

---

### ❌ Problème 7 : "Debug already active" mais rien ne s'affiche

**Symptômes :**
- Console affiche "Debug already active"
- Mais overlay invisible

**Solution :**
```javascript
// Forcer le réaffichage
const overlay = document.getElementById('debug-overlay');
if (overlay) {
  overlay.style.display = 'flex';
  overlay.style.zIndex = '999999';
}

// Ou relancer complètement
StopAddictDebug.deactivate();
await StopAddictDebug.activate();
```

---

## 👁️ Problèmes d'affichage

### ❌ Problème 8 : L'overlay est invisible

**Symptômes :**
- `StopAddictDebug.getState().active` est true
- Mais overlay introuvable visuellement

**Diagnostic :**
```javascript
// Vérifier si l'overlay existe dans le DOM
const overlay = document.getElementById('debug-overlay');
console.log('Overlay existe ?', overlay !== null);

// Vérifier les styles
if (overlay) {
  const styles = window.getComputedStyle(overlay);
  console.log('Display :', styles.display);
  console.log('Visibility :', styles.visibility);
  console.log('Opacity :', styles.opacity);
  console.log('Z-index :', styles.zIndex);
}
```

**Solutions :**

#### Solution 8.1 : Forcer l'affichage
```javascript
const overlay = document.getElementById('debug-overlay');
if (overlay) {
  overlay.style.display = 'flex';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
  overlay.style.zIndex = '999999';
  overlay.style.position = 'fixed';
  overlay.style.top = '10px';
  overlay.style.left = '10px';
}
```

#### Solution 8.2 : Vérifier les conflits CSS
```javascript
// Chercher les règles CSS qui pourraient cacher l'overlay
// F12 → Elements → Sélectionner #debug-overlay → Styles
// Chercher :
// - display: none
// - visibility: hidden
// - opacity: 0
// - z-index trop bas
```

#### Solution 8.3 : Inspecter les superpositions
```javascript
// Vérifier si un autre élément cache l'overlay
document.querySelectorAll('*').forEach(el => {
  const z = window.getComputedStyle(el).zIndex;
  if (z && parseInt(z) > 99999) {
    console.log('Élément avec z-index élevé :', el, z);
  }
});
```

---

### ❌ Problème 9 : L'overlay est trop petit/trop grand

**Solutions :**

#### Solution 9.1 : Ajuster via console
```javascript
const overlay = document.getElementById('debug-overlay');

// Trop petit → agrandir
overlay.style.maxWidth = '800px';
overlay.style.maxHeight = '90vh';

// Trop grand → réduire
overlay.style.maxWidth = '400px';
overlay.style.maxHeight = '60vh';
```

#### Solution 9.2 : Modifier debug-ui.js définitivement
```javascript
// Ouvrir debug-ui.js
// Chercher createOverlay()
// Modifier les lignes de style :
overlayElement.style.cssText = `
  ...
  max-width: 600px;  // Votre valeur
  max-height: 70vh;  // Votre valeur
  ...
`;
```

---

### ❌ Problème 10 : Les logs ne s'affichent pas dans l'overlay

**Symptômes :**
- Overlay visible
- Mais zone des logs vide

**Diagnostic :**
```javascript
// Vérifier l'historique des logs
import('./js/debug/debug-logger.js').then(logger => {
  const history = logger.getHistory();
  console.log(`${history.length} logs enregistrés`);
  console.log(history);
});
```

**Solutions :**

#### Solution 10.1 : Relancer les tests
```javascript
await StopAddictDebug.runTests();
// Les logs devraient apparaître
```

#### Solution 10.2 : Vérifier le container
```javascript
const logsContainer = document.querySelector('.debug-logs');
console.log('Container existe ?', logsContainer !== null);
console.log('Enfants :', logsContainer?.children.length);
```

#### Solution 10.3 : Recharger l'historique
```javascript
// Dans debug-ui.js, forcer le rechargement
import { getHistory } from './debug-logger.js';
const history = getHistory();
history.forEach(log => {
  console.log(log); // Devrait aussi être dans l'UI
});
```

---

### ❌ Problème 11 : Texte illisible (trop petit, mauvaise couleur)

**Solutions :**
```javascript
const overlay = document.getElementById('debug-overlay');

// Augmenter la taille du texte
overlay.style.fontSize = '14px';

// Changer les couleurs
overlay.style.background = 'rgba(0, 0, 0, 0.95)'; // Plus sombre
overlay.style.color = '#ffffff'; // Texte blanc

// Ou plus clair
overlay.style.background = 'rgba(255, 255, 255, 0.95)';
overlay.style.color = '#000000';
```

---

## 📥 Erreurs de chargement

### ❌ Problème 12 : "Unexpected token 'export'"

**Symptômes :**
```
Uncaught SyntaxError: Unexpected token 'export'
```

**Cause :**
- Les modules ES6 ne sont pas reconnus
- Mauvais type de script

**Solutions :**

#### Solution 12.1 : Vérifier le type de script
```html
<!-- ✅ CORRECT pour les modules ES6 -->
<script type="module" src="./js/debug.js"></script>

<!-- ❌ INCORRECT -->
<script src="./js/debug.js"></script>
```

**ATTENTION :** debug.js principal n'est PAS un module ES6, il ne faut PAS mettre `type="module"` !
```html
<!-- ✅ CORRECT -->
<script src="./js/debug.js"></script>
```

#### Solution 12.2 : Vérifier la compatibilité navigateur
```javascript
// Tester le support des modules
if ('noModule' in HTMLScriptElement.prototype) {
  console.log('✅ Modules ES6 supportés');
} else {
  console.error('❌ Modules ES6 NON supportés');
  console.log('Navigateur requis : Chrome 61+, Firefox 60+, Safari 11+');
}
```

---

### ❌ Problème 13 : "Cannot read property of undefined"

**Symptômes :**
```
Uncaught TypeError: Cannot read property 'testDOM' of undefined
```

**Cause :**
- Un module n'a pas été chargé correctement
- Appel avant l'initialisation

**Solutions :**

#### Solution 13.1 : Vérifier l'ordre d'initialisation
```javascript
// debug.js doit attendre le DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

#### Solution 13.2 : Ajouter des vérifications
```javascript
// Avant d'utiliser un module
if (debugDOM && typeof debugDOM.testDOM === 'function') {
  debugDOM.testDOM();
} else {
  console.error('debugDOM non disponible');
}
```

#### Solution 13.3 : Attendre le chargement complet
```javascript
// Attendre que tout soit prêt
window.addEventListener('load', async () => {
  await StopAddictDebug.activate();
});
```

---

## 🧪 Problèmes de tests

### ❌ Problème 14 : Les tests ne se lancent pas

**Symptômes :**
- Activation réussie
- Mais aucun test ne s'exécute
- Overlay vide

**Diagnostic :**
```javascript
const state = StopAddictDebug.getState();
console.log('Modules chargés :', state.modules);
console.log('Résultats :', state.results);
```

**Solutions :**

#### Solution 14.1 : Lancer manuellement
```javascript
await StopAddictDebug.runTests();
```

#### Solution 14.2 : Vérifier les erreurs de modules
```javascript
const state = StopAddictDebug.getState();
Object.entries(state.modules).forEach(([name, info]) => {
  if (!info.loaded) {
    console.error(`❌ ${name} : ${info.error}`);
  }
});
```

---

### ❌ Problème 15 : Tous les tests échouent

**Diagnostic :**
```javascript
const results = StopAddictDebug.getResults();
console.log('Modules failed :', results.modules?.failed);
console.log('DOM failed :', results.dom?.failed);
console.log('Storage failed :', results.storage?.failed);
```

**Solutions :**

#### Solution 15.1 : Vérifier que le DOM est chargé
```javascript
console.log('Document ready ?', document.readyState);
// Doit être 'complete' ou 'interactive'

// Si 'loading', attendre
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StopAddictDebug.runTests();
  });
}
```

#### Solution 15.2 : Tester sur la bonne page
```javascript
// Le debug tool est conçu pour StopAddict
// Vérifier que vous êtes sur la bonne page
console.log('URL :', window.location.href);
console.log('Title :', document.title);
// Doit contenir "StopAddict"
```

---

### ❌ Problème 16 : "89 IDs manquants"

**Explication :**
- C'est NORMAL si vous testez sur une page différente
- Les IDs sont spécifiques à StopAddict

**Solutions :**

#### Solution 16.1 : Vérifier la page
```javascript
// Assurez-vous d'être sur index.html de StopAddict
console.log(window.location.pathname);
// Doit être /index.html ou /
```

#### Solution 16.2 : Adapter la configuration

Si vous voulez utiliser le debug sur une autre app :
```javascript
// Éditer config/ids-list.json
// Remplacer par les IDs de VOTRE application
{
  "categories": {
    "mesElements": {
      "ids": ["mon-id-1", "mon-id-2", ...]
    }
  }
}
```

---

## 💾 Problèmes d'export

### ❌ Problème 17 : Le bouton "Copier" ne fonctionne pas

**Symptômes :**
- Clic sur "Copier"
- Rien ne se copie dans le clipboard

**Diagnostic :**
```javascript
// Tester le clipboard
navigator.clipboard.writeText('test')
  .then(() => console.log('✅ Clipboard fonctionne'))
  .catch(e => console.error('❌ Clipboard bloqué :', e));
```

**Solutions :**

#### Solution 17.1 : Autoriser le clipboard

**Chrome :**
1. Cliquer sur l'icône cadenas (barre d'adresse)
2. Autorisations
3. Clipboard → Autoriser

**Firefox :**
1. about:config
2. Chercher : `dom.events.asyncClipboard.enabled`
3. Mettre à `true`

#### Solution 17.2 : Utiliser le fallback manuel
```javascript
// Récupérer le texte manuellement
const text = document.querySelector('.debug-logs').innerText;
console.log(text);
// Copier manuellement depuis la console (Ctrl+A puis Ctrl+C)
```

#### Solution 17.3 : Télécharger au lieu de copier
```javascript
// Utiliser le bouton "Export TXT" à la place
// Ou via console :
import('./utils/exporter.js').then(exp => {
  const state = StopAddictDebug.getState();
  exp.exportToTXT(state);
});
```

---

### ❌ Problème 18 : Le téléchargement .txt ne démarre pas

**Symptômes :**
- Clic sur "Export TXT"
- Rien ne se télécharge

**Solutions :**

#### Solution 18.1 : Vérifier les pop-ups
```javascript
// Le navigateur bloque-t-il les téléchargements ?
// Chrome : Barre d'adresse → icône téléchargement bloqué
// Cliquer → Autoriser
```

#### Solution 18.2 : Forcer le téléchargement
```javascript
import('./utils/exporter.js').then(exp => {
  const state = StopAddictDebug.getState();
  const result = exp.exportToTXT(state);
  console.log(result);
});
```

#### Solution 18.3 : Téléchargement manuel
```javascript
// Générer le rapport
import('./utils/reporter.js').then(rep => {
  const state = StopAddictDebug.getState();
  const report = rep.generateTextReport(state);
  
  // Créer un blob manuellement
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Télécharger
  const a = document.createElement('a');
  a.href = url;
  a.download = 'debug-report.txt';
  a.click();
});
```

---

## ⚡ Problèmes de performance

### ❌ Problème 19 : Le debug ralentit l'application

**Symptômes :**
- L'app devient lente après activation du debug
- Lag visible

**Solutions :**

#### Solution 19.1 : Désactiver quand non utilisé
```javascript
// Désactiver le debug
StopAddictDebug.deactivate();

// L'application redevient rapide
```

#### Solution 19.2 : Réduire l'historique des logs
```javascript
// Éditer debug-logger.js
// Ligne ~15
const MAX_HISTORY_SIZE = 20; // Au lieu de 50
```

#### Solution 19.3 : Désactiver la sauvegarde localStorage
```javascript
// Éditer debug-logger.js
// Dans la fonction log(), commenter :
// saveHistory(); // ← Commenter cette ligne
```

#### Solution 19.4 : Réduire la fréquence de refresh UI
```javascript
// Éditer debug-ui.js
// Throttle les updates
let lastUpdate = 0;
function onNewLog(logEntry) {
  const now = Date.now();
  if (now - lastUpdate < 100) return; // Max 10 updates/sec
  lastUpdate = now;
  // ... reste du code
}
```

---

### ❌ Problème 20 : L'overlay consomme trop de mémoire

**Solutions :**
```javascript
// Limiter le nombre de logs affichés
// Dans debug-ui.js, fonction loadHistory()
const history = getHistory().slice(-20); // Seulement les 20 derniers

// Vider l'overlay périodiquement
setInterval(() => {
  if (logsContainer.children.length > 50) {
    // Garder seulement les 30 derniers
    while (logsContainer.children.length > 30) {
      logsContainer.removeChild(logsContainer.firstChild);
    }
  }
}, 10000); // Toutes les 10 secondes
```

---

## 📱 Problèmes spécifiques mobile

### ❌ Problème 21 : L'overlay ne s'affiche pas sur mobile

**Solutions :**

#### Solution 21.1 : Adapter la taille pour mobile
```javascript
// Dans debug-ui.js, ajouter media query
if (window.innerWidth < 768) {
  overlayElement.style.cssText += `
    max-width: 95vw !important;
    max-height: 80vh !important;
    font-size: 10px !important;
  `;
}
```

#### Solution 21.2 : Forcer l'affichage mobile
```css
/* Ajouter dans un style inline ou fichier CSS */
@media (max-width: 768px) {
  #debug-overlay {
    display: flex !important;
    position: fixed !important;
    top: 5px !important;
    left: 5px !important;
    right: 5px !important;
    max-width: calc(100vw - 10px) !important;
  }
}
```

---

### ❌ Problème 22 : Les 5 taps sont difficiles sur mobile

**Solutions :**

#### Solution 22.1 : Réduire le nombre de taps
```javascript
// debug-ui.js, ligne ~15
const TOGGLE_TAPS = 3; // Plus facile
```

#### Solution 22.2 : Augmenter le timeout
```javascript
// debug-ui.js, ligne ~16
const TAP_TIMEOUT = 2000; // 2 secondes au lieu de 800ms
```

#### Solution 22.3 : Ajouter un bouton visible
```html
<!-- Dans index.html, ajouter un bouton debug -->
<button 
  id="debug-toggle-btn"
  style="position: fixed; bottom: 20px; right: 20px; 
         z-index: 9998; padding: 10px 15px;
         background: #3b82f6; color: white; 
         border: none; border-radius: 8px;">
  🔍
</button>

<script>
document.getElementById('debug-toggle-btn').addEventListener('click', () => {
  StopAddictDebug.toggle();
});
</script>
```

---

### ❌ Problème 23 : Samsung Galaxy S9+ - Chart.js ne charge pas

**Symptômes spécifiques S9+ :**
- Chart.js undefined
- Graphiques non affichés

**Solutions :**

#### Solution 23.1 : Vérifier la version de Chrome
```javascript
// Console mobile (via USB debugging)
console.log(navigator.userAgent);
// Chrome 70+ requis
```

#### Solution 23.2 : Utiliser le fallback automatique
```javascript
// Le debug tool créera automatiquement un stub
// Vérifier dans les résultats :
const results = StopAddictDebug.getResults();
console.log('Chart fallback créé ?', results.chartFallback);
```

#### Solution 23.3 : Charger Chart.js manuellement
```html
<!-- Dans index.html, ajouter CDN fallback -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
```

---

### ❌ Problème 24 : localStorage plein sur mobile

**Symptômes :**
```
QuotaExceededError: Failed to execute 'setItem' on 'Storage'
```

**Solutions :**

#### Solution 24.1 : Nettoyer le localStorage
```javascript
// Supprimer les données anciennes ou inutiles
Object.keys(localStorage).forEach(key => {
  if (key.includes('OLD') || key.includes('cache')) {
    localStorage.removeItem(key);
  }
});
```

#### Solution 24.2 : Réduire les données debug
```javascript
// Supprimer l'historique debug
localStorage.removeItem('SA_DEBUG_HISTORY');

// Le debug tool créera automatiquement
// une version allégée si nécessaire
```

#### Solution 24.3 : Vérifier la taille du storage
```javascript
import('./debug/debug-storage.js').then(storage => {
  const size = storage.getStorageSize();
  console.log(`LocalStorage : ${size.kb} KB`);
  // Max environ 5-10 MB sur mobile
});
```

---

## 🆘 Problèmes critiques

### ❌ Problème 25 : L'application ne démarre plus après installation du debug

**Solutions d'urgence :**

#### Solution 25.1 : Désactivation immédiate
```javascript
// Dans la console (F12)
localStorage.setItem('SA_DEBUG', 'false');
location.reload();
```

#### Solution 25.2 : Retirer debug.js temporairement
```html
<!-- Dans index.html, commenter la ligne -->
<!-- <script src="./js/debug.js"></script> -->

<!-- Sauvegarder et recharger -->
```

#### Solution 25.3 : Mode sans échec
```javascript
// Éditer debug.js, ajouter en tout début :
if (location.search.includes('nodebug')) {
  console.log('[debug.js] Safe mode enabled - not loading');
  window.StopAddictDebug = { 
    activate: () => console.log('Debug disabled in safe mode'),
    deactivate: () => {},
    toggle: () => {},
    getState: () => ({}),
    getResults: () => ({})
  };
  return;
}

// Puis accéder à : http://localhost:8000?nodebug
```

---

### ❌ Problème 26 : Boucle infinie d'erreurs

**Symptômes :**
- Console inondée d'erreurs
- Navigateur freeze

**Solution immédiate :**
```javascript
// CTRL+R (force reload) pour arrêter
// Puis désactiver immédiatement :
localStorage.clear();
// Et retirer debug.js du HTML
```

---

## 🔄 Réinitialisation complète

Si RIEN ne fonctionne, réinitialisation totale :

### Étape 1 : Nettoyer localStorage
```javascript
// Console
localStorage.clear();
// Ou ciblé :
localStorage.removeItem('SA_DEBUG');
localStorage.removeItem('SA_DEBUG_HISTORY');
```

### Étape 2 : Supprimer tous les fichiers debug
```bash
# Terminal
rm -rf debug/
rm -rf config/
rm -rf utils/
rm -rf scripts/
```

### Étape 3 : Re-télécharger depuis GitHub
```bash
git clone https://github.com/votre-username/stopaddict-debug-tool
# Ou télécharger le ZIP
```

### Étape 4 : Réinstaller proprement

Suivre [INSTALL.md](../INSTALL.md) depuis le début.

### Étape 5 : Tester sur page minimale
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Debug</title>
</head>
<body>
  <h1 class="header">Test</h1>
  <div id="cl-plus">Bouton test</div>
  
  <script src="./js/debug.js"></script>
  <script>
    window.addEventListener('load', async () => {
      await StopAddictDebug.activate();
    });
  </script>
</body>
</html>
```

---

## 📞 Obtenir de l'aide

Si le problème persiste après toutes ces solutions :

### 1. Générer un rapport de diagnostic
```javascript
// Activer le debug (même si ça ne marche pas bien)
try {
  await StopAddictDebug.activate();
} catch(e) {
  console.error('Activation failed:', e);
}

// Récupérer l'état complet
const state = StopAddictDebug.getState();
console.log(JSON.stringify(state, null, 2));
// Copier tout le JSON
```

### 2. Informations à fournir

- **Navigateur** : Chrome 122.0.6261.95 (exemple)
- **OS** : Windows 11 / macOS 14 / Android 12
- **Appareil** : Samsung Galaxy S9+ (si mobile)
- **URL** : localhost:8000 ou file:// ?
- **Erreurs console** : Copier toutes les erreurs rouges
- **Étapes pour reproduire** : 1, 2, 3...
- **Rapport debug** : Le JSON généré ci-dessus

### 3. Créer une Issue GitHub

1. Aller sur : https://github.com/votre-username/stopaddict-debug-tool/issues
2. Cliquer "New Issue"
3. Titre clair : "Debug ne s'active pas sur mobile S9+"
4. Inclure TOUTES les infos ci-dessus
5. Joindre le fichier de rapport si possible

### 4. Logs navigateur (optionnel mais utile)

#### Sur ordinateur :
- F12 → Console → Clic droit → Save as...
- Envoyer le fichier

#### Sur mobile (Android) :
```bash
# Via USB debugging
adb logcat -d > mobile-logs.txt
```

---

## ✅ Checklist finale de dépannage

Avant de demander de l'aide, vérifier TOUTES ces cases :

- [ ] debug.js est chargé AVANT app.js dans index.html
- [ ] Tous les fichiers debug/*.js existent et sont au bon endroit
- [ ] Console F12 ne montre pas d'erreurs de syntaxe
- [ ] Page servie via HTTP (pas file://)
- [ ] Navigateur à jour (Chrome 70+, Firefox 60+, Safari 11+)
- [ ] `window.StopAddictDebug` existe (pas undefined)
- [ ] localStorage n'est pas plein
- [ ] Testé l'activation manuelle via `StopAddictDebug.activate()`
- [ ] Vérifié les conflits CSS (z-index, display)
- [ ] Vérifié le sélecteur du header (.header ou .brand)
- [ ] Tenté une réinitialisation localStorage
- [ ] Testé sur page HTML minimale
- [ ] Lu toutes les sections de ce guide
- [ ] Cherché dans les Issues GitHub existantes

---

## 📚 Ressources complémentaires

- **[API Documentation](./API.md)** - Référence complète de l'API
- **[Examples](./EXAMPLES.md)** - Exemples d'utilisation
- **[README principal](../README.md)** - Vue d'ensemble
- **[INSTALL.md](../INSTALL.md)** - Guide d'installation
- **[Issues GitHub](https://github.com/votre-username/stopaddict-debug-tool/issues)** - Problèmes connus

---

## 🎓 Conseils généraux

### Pour éviter les problèmes :

1. **Toujours tester sur un serveur HTTP local** (jamais file://)
2. **Commencer simple** : activer le debug sur une page vide d'abord
3. **Lire la console** : 90% des problèmes sont visibles dans F12
4. **Ne pas modifier les fichiers** : utiliser les versions originales
5. **Vérifier les mises à jour** : Le debug tool peut être mis à jour

### En cas de doute :

- **Désactiver temporairement** : `localStorage.setItem('SA_DEBUG', 'false')`
- **Tester l'activation manuelle** : `await StopAddictDebug.activate()`
- **Vérifier l'état** : `console.log(StopAddictDebug.getState())`

---

**Version du guide :** 1.0.0  
**Dernière mise à jour :** 2025-10-24  
**Couverture :** 26 problèmes courants + solutions

---

**💡 Astuce finale :**  
La plupart des problèmes viennent de l'ordre de chargement ou du serveur HTTP.  
Commencez TOUJOURS par vérifier ces deux points ! 🚀
