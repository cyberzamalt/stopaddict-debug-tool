# 🔧 Troubleshooting - Debug Tool StopAddict

Guide de dépannage pour résoudre les problèmes courants.

---

## 📋 Table des matières

- [Problèmes d'installation](#problèmes-dinstallation)
- [Problèmes d'activation](#problèmes-dactivation)
- [Problèmes d'affichage](#problèmes-daffichage)
- [Erreurs de chargement](#erreurs-de-chargement)
- [Problèmes de tests](#problèmes-de-tests)
- [Problèmes d'export](#problèmes-dexport)
- [Problèmes de performance](#problèmes-de-performance)

---

## 🚨 Problèmes d'installation

### ❌ Le script debug.js ne se charge pas

**Symptômes :**
- Aucun message `[debug.js]` dans la console
- `window.StopAddictDebug` est undefined

**Solutions :**

1. **Vérifier le chemin du fichier**
```html
<!-- Correct -->
<script src="./js/debug.js"></script>

<!-- Incorrect -->
<script src="debug.js"></script>
<script src="/debug.js"></script>
```

2. **Vérifier l'ordre de chargement**
```html
<!-- ✅ CORRECT : debug.js EN PREMIER -->
<script src="./js/debug.js"></script>
<script src="./js/vendor/chart.umd.min.js"></script>
<script type="module" src="./js/app.js"></script>

<!-- ❌ INCORRECT : debug.js après app.js -->
<script type="module" src="./js/app.js"></script>
<script src="./js/debug.js"></script>
```

3. **Vérifier dans la console**
```javascript
// F12 → Console
console.log(window.StopAddictDebug);
// Devrait afficher un objet, pas undefined
```

4. **Vérifier les erreurs de syntaxe**
- Ouvrir F12 → Console
- Chercher des erreurs en rouge
- Si erreur de syntaxe dans debug.js → Re-télécharger le fichier

---

### ❌ Erreur "Module not found"

**Symptômes :**
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type...
```

**Solutions :**

1. **Serveur HTTP requis**
```bash
# Ne PAS ouvrir directement le fichier (file://)
# Utiliser un serveur local :

# Avec Python 3
python -m http.server 8000

# Avec Node.js
npx serve

# Avec PHP
php -S localhost:8000
```

2. **Vérifier les extensions de fichiers**
- Tous les fichiers doivent être en `.js` (pas `.txt`, `.js.txt`, etc.)

---

## 🔓 Problèmes d'activation

### ❌ 5 taps ne fonctionnent pas

**Symptômes :**
- Taper 5 fois sur le header ne fait rien
- Aucun overlay ne s'affiche

**Solutions :**

1. **Vérifier que le debug.js est chargé**
```javascript
// Console
console.log(window.StopAddictDebug);
// Doit afficher un objet
```

2. **Vérifier le sélecteur header**
```javascript
// Le tap listener cherche :
const header = document.querySelector('.header') || document.querySelector('.brand');

// Vérifier si votre header correspond :
console.log(document.querySelector('.header'));
// Doit trouver un élément
```

3. **Modifier le sélecteur si nécessaire**
- Éditer `debug-ui.js`
- Ligne `attachTapListener()`
- Changer le sélecteur :
```javascript
const header = document.querySelector('#mon-header'); // Votre sélecteur
```

4. **Activation manuelle**
```javascript
// Dans la console
await StopAddictDebug.activate();
```

---

### ❌ Le debug s'active mais se désactive immédiatement

**Symptômes :**
- L'overlay apparaît puis disparaît
- Le localStorage est réinitialisé

**Solutions :**

1. **Vérifier le localStorage**
```javascript
// Console
console.log(localStorage.getItem('SA_DEBUG'));
// Doit être 'true'
```

2. **Forcer l'activation persistante**
```javascript
localStorage.setItem('SA_DEBUG', 'true');
location.reload();
```

3. **Vérifier les conflits**
- Un autre script réinitialise-t-il le localStorage ?
- Chercher `localStorage.clear()` dans app.js

---

## 👁️ Problèmes d'affichage

### ❌ L'overlay est invisible

**Symptômes :**
- Le debug est actif (console le confirme)
- Mais aucun overlay visible

**Solutions :**

1. **Vérifier le z-index**
```javascript
// Console
const overlay = document.getElementById('debug-overlay');
console.log(window.getComputedStyle(overlay).zIndex);
// Doit être > 9999
```

2. **Forcer l'affichage**
```javascript
// Console
const overlay = document.getElementById('debug-overlay');
overlay.style.display = 'flex';
overlay.style.zIndex = '999999';
```

3. **Vérifier les conflits CSS**
- Un autre CSS cache-t-il l'overlay ?
- Chercher dans les DevTools → Elements → Styles

---

### ❌ L'overlay est trop petit/trop grand

**Solutions :**

1. **Modifier les dimensions**
```javascript
// Console
const overlay = document.getElementById('debug-overlay');
overlay.style.maxWidth = '600px';  // Largeur
overlay.style.maxHeight = '80vh';  // Hauteur
```

2. **Éditer debug-ui.js**
```javascript
// Ligne ~80
overlayElement.style.cssText = `
  ...
  max-width: 600px;  // Changer ici
  max-height: 80vh;  // Et ici
  ...
`;
```

---

### ❌ Les logs ne s'affichent pas

**Symptômes :**
- L'overlay est visible mais vide
- Aucun log ne s'affiche

**Solutions :**

1. **Vérifier le logger**
```javascript
// Console
import('./js/debug/debug-logger.js').then(logger => {
  console.log(logger.getHistory());
});
```

2. **Relancer les tests**
```javascript
await StopAddictDebug.runTests();
```

3. **Vérifier les erreurs**
- F12 → Console
- Chercher des erreurs liées à debug-logger.js

---

## 📥 Erreurs de chargement

### ❌ "Cannot find module './debug-logger.js'"

**Solutions :**

1. **Vérifier que tous les fichiers existent**
```
debug/
├── debug.js
├── debug-logger.js  ← Doit exister
├── debug-ui.js
├── debug-modules.js
└── ...
```

2. **Vérifier les chemins relatifs**
```javascript
// Dans debug.js
import debugLogger from './debug-logger.js';  // ✅ Correct
import debugLogger from 'debug-logger.js';    // ❌ Incorrect
```

3. **Vérifier les extensions**
- Les imports doivent inclure `.js`
- Pas de `.mjs`, `.jsx`, etc.

---

### ❌ "Unexpected token 'export'"

**Solutions :**

1. **Vérifier le type de script**
```html
<!-- ✅ Correct pour les modules ES6 -->
<script type="module" src="./js/debug.js"></script>

<!-- ❌ Incorrect -->
<script src="./js/debug.js"></script>
```

2. **Vérifier le navigateur**
- Les modules ES6 nécessitent un navigateur récent
- Chrome 61+, Firefox 60+, Safari 11+

---

## 🧪 Problèmes de tests

### ❌ Les tests ne se lancent pas

**Solutions :**

1. **Lancer manuellement**
```javascript
await StopAddictDebug.runTests();
```

2. **Vérifier les modules**
```javascript
const state = StopAddictDebug.getState();
console.log(state.modules);
// Tous doivent être loaded: true
```

3. **Voir les erreurs**
```javascript
const state = StopAddictDebug.getState();
console.log(state.errors);
```

---

### ❌ Tous les tests échouent

**Solutions :**

1. **Vérifier le DOM**
```javascript
// Le DOM doit être chargé
console.log(document.readyState);
// Doit être 'complete' ou 'interactive'
```

2. **Attendre le chargement**
```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await StopAddictDebug.activate();
  });
}
```

---

### ❌ "89 IDs manquants"

**Explication :**
- C'est normal si vous testez sur une page HTML différente
- Les IDs sont spécifiques à StopAddict

**Solutions :**

1. **Tester sur la bonne page**
- Le debug tool est fait pour StopAddict
- Ne fonctionne pas sur d'autres applications

2. **Adapter la configuration**
- Éditer `config/ids-list.json`
- Ajouter/retirer les IDs selon votre application

---

## 💾 Problèmes d'export

### ❌ Le bouton "Copier" ne fonctionne pas

**Solutions :**

1. **Vérifier les permissions**
- Le navigateur bloque-t-il le clipboard ?
- Regarder dans F12 → Console

2. **Autoriser le clipboard**
- Chrome : Paramètres → Confidentialité → Presse-papiers
- Firefox : about:config → dom.events.asyncClipboard.enabled → true

3. **Utiliser le fallback**
```javascript
// Le fallback s'active automatiquement
// Si ça ne marche toujours pas :
const report = document.querySelector('.debug-logs').innerText;
console.log(report); // Copier manuellement
```

---

### ❌ Le téléchargement .txt ne démarre pas

**Solutions :**

1. **Vérifier les pop-ups**
- Le navigateur bloque-t-il les téléchargements ?
- Autoriser les pop-ups pour cette page

2. **Forcer le téléchargement**
```javascript
// Console
const state = StopAddictDebug.getState();
import('./js/utils/exporter.js').then(exp => {
  exp.exportToTXT(state);
});
```

---
