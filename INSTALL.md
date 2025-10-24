# 📦 Installation du Debug Tool StopAddict

Guide pas à pas pour intégrer le debug tool dans votre application StopAddict.

---

## ⚡ Installation Rapide (5 minutes)

### Étape 1 : Télécharger le fichier debug.js

1. Allez sur ce repository : [stopaddict-debug-tool](https://github.com/votre-username/stopaddict-debug-tool)
2. Naviguez vers `debug/debug.js`
3. Cliquez sur **"Raw"** puis **Ctrl+S** (ou clic droit → Enregistrer sous)
4. Sauvegardez le fichier dans votre projet StopAddict

### Étape 2 : Placer le fichier au bon endroit

Copiez `debug.js` dans votre dossier StopAddict :
```
stopaddict-main/
└── web/
    └── js/
        ├── debug.js  ← ✅ ICI
        ├── app.js
        ├── state.js
        └── ...
```

### Étape 3 : Ajouter dans index.html

Ouvrez `web/index.html` et ajoutez le script **AVANT tous les autres scripts** :
```html
<!-- ⚡ DEBUG TOOL - À placer AVANT tous les autres scripts -->
<script src="./js/debug.js"></script>

<!-- Vendor (Chart.js ou fallback local) -->
<script src="./js/vendor/chart.umd.min.js"></script>

<!-- App -->
<script type="module" src="./js/app.js"></script>
</body>
</html>
```

**⚠️ IMPORTANT :** Le debug.js doit être chargé **EN PREMIER** pour capturer toutes les erreurs !

---

## 🚀 Activation

### Sur ordinateur (navigateur)

#### Méthode 1 : Via localStorage
```javascript
// Ouvrez la console (F12)
localStorage.setItem('SA_DEBUG', 'true');
location.reload();
```

#### Méthode 2 : 5 taps sur le header
1. Cliquez 5 fois rapidement sur le titre "🚭 StopAddict"
2. La console debug apparaît

### Sur mobile (Samsung Galaxy S9+)

#### Méthode unique : 5 taps sur le header
1. Ouvrez StopAddict sur votre téléphone
2. Tapez 5 fois rapidement sur le titre "🚭 StopAddict"
3. La console debug s'affiche

---

## 📱 Interface Overlay

Une fois activé, vous verrez une console en overlay :
```
┌─────────────────────────────────┐
│  🔍 DEBUG STOPADDICT v1.0       │
├─────────────────────────────────┤
│ [14:30:45] Tests en cours...    │
│                                 │
│ ✅ MODULES (5/5)                │
│ ✓ state.js chargé (120ms)      │
│ ✓ app.js chargé (80ms)         │
│ ✓ counters.js chargé (45ms)    │
│ ✓ charts.js chargé (210ms)     │
│ ✓ modals.js chargé (35ms)      │
│                                 │
│ ✅ IDS HTML (89/89)             │
│ ✓ Tous les IDs trouvés         │
│                                 │
│ ✅ LOCALSTORAGE (5/5)           │
│ ✓ Toutes les clés présentes    │
│                                 │
│ ✅ CHART.JS                     │
│ ✓ Disponible (v3.9.1)          │
│                                 │
│ [Copier] [Export TXT] [Fermer] │
└─────────────────────────────────┘
```

---

## 🎯 Utilisation

### Voir les résultats

La console affiche automatiquement :
- ✅ Modules chargés avec succès
- ❌ Modules en erreur (avec détails)
- ✅/❌ IDs HTML trouvés/manquants
- ✅/❌ LocalStorage valide/corrompu
- ⚠️ Avertissements divers

### Exporter le rapport

#### Bouton "Copier"
Copie tout le rapport dans votre clipboard. Ensuite :
1. Collez dans un email
2. Ou dans un document texte
3. Ou dans un message

#### Bouton "Export TXT"
Télécharge un fichier `debug-report-YYYY-MM-DD-HHmmss.txt` :
```
DEBUG STOPADDICT - Rapport complet
Généré le : 2025-10-24 à 14:30:45
==========================================

MODULES JS
----------
✅ state.js : OK (120ms)
   - 24 exports vérifiés
   - emit() : OK
   - on() : OK
   - getAggregates() : OK
   ...

❌ charts.js : ERREUR
   - Chart.js non disponible
   - window.Chart = undefined
   
...
```

### Désactiver le debug

#### Temporairement
Cliquez sur le bouton **[Fermer]** dans l'overlay

#### Définitivement
```javascript
localStorage.removeItem('SA_DEBUG');
location.reload();
```

---

## 🔧 Configuration avancée (optionnel)

### Personnaliser les tests

Vous pouvez configurer quels tests exécuter en modifiant les fichiers JSON :

- `config/ids-list.json` → Ajouter/retirer des IDs à tester
- `config/modules-list.json` → Modifier la liste des modules
- `config/localStorage-keys.json` → Changer les clés à vérifier

### Logs dans la console navigateur

En plus de l'overlay, tous les logs sont aussi dans la console :
```javascript
[debug.js] Initialisation...
[debug.modules] Test de state.js...
[debug.modules] ✅ state.js : 24/24 exports OK
[debug.dom] Test des IDs HTML...
[debug.dom] ✅ 89/89 IDs trouvés
```

---

## ❌ Désinstallation

Pour retirer complètement le debug tool :

1. Ouvrez `web/index.html`
2. Supprimez la ligne :
```html
   <script src="./js/debug.js"></script>
```
3. Supprimez le fichier `web/js/debug.js`
4. Nettoyez localStorage :
```javascript
   localStorage.removeItem('SA_DEBUG');
   localStorage.removeItem('SA_DEBUG_HISTORY');
```

---

## 🐛 Dépannage

### Le debug ne s'active pas

**Problème :** 5 taps sur le header ne font rien

**Solutions :**
1. Vérifiez que `debug.js` est bien chargé dans index.html
2. Vérifiez qu'il est chargé **AVANT** app.js
3. Ouvrez la console (F12) et cherchez `[debug.js]`
4. Si erreur de syntaxe → re-téléchargez debug.js

### L'overlay ne s'affiche pas

**Problème :** Le debug est activé mais l'overlay est invisible

**Solutions :**
1. Vérifiez le CSS : `#debug-console { display: block !important; }`
2. Vérifiez les z-index (l'overlay doit être > 9999)
3. Regardez la console navigateur pour les erreurs

### Erreurs dans la console

**Problème :** `Uncaught ReferenceError: debugInit is not defined`

**Solution :**
- debug.js n'est pas chargé correctement
- Vérifiez le chemin : `./js/debug.js`
- Vérifiez que le fichier n'est pas corrompu

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez** [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. **Cherchez** dans les [Issues GitHub](https://github.com/votre-username/stopaddict-debug-tool/issues)
3. **Créez** une nouvelle issue avec :
   - Description du problème
   - Capture d'écran
   - Console logs (F12)
   - Version de StopAddict

---

## ✅ Checklist post-installation

- [ ] debug.js copié dans `web/js/`
- [ ] Script ajouté dans index.html (AVANT app.js)
- [ ] Test sur navigateur : 5 taps → overlay apparaît
- [ ] Test sur mobile : 5 taps → overlay apparaît
- [ ] Export TXT fonctionne
- [ ] Copie clipboard fonctionne

---

**🎉 Félicitations ! Le debug tool est maintenant installé !**

Pour aller plus loin, consultez la [documentation complète](./docs/API.md).
