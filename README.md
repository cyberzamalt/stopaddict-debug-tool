# 🔍 StopAddict Debug Tool

> Mini-application de diagnostic intégrée pour identifier automatiquement les problèmes de l'application StopAddict directement sur mobile, sans outils externes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/)
[![Mobile Ready](https://img.shields.io/badge/Mobile-Ready-green.svg)]()

---

## 🎯 Objectif

Créer une mini-application de debug intégrée qui permet de diagnostiquer automatiquement les problèmes de **StopAddict** directement sur mobile, sans besoin d'outils externes comme la console navigateur.

### ❓ Question initiale
*"On peut pas faire une appli qui va identifier ce qui bloque lorsque je lance stop addict spécifiquement sur le tel ?"*

### ✅ Réponse
**OUI, C'EST POSSIBLE !** Ce repository contient tous les outils nécessaires.

---

## ✨ Fonctionnalités

### 1. 📱 Overlay Debug - Affichage en temps réel
- ✅ Console visible en overlay sur l'écran mobile
- ✅ Activation/désactivation par tap prolongé (5 taps sur header)
- ✅ Position fixe, non intrusive
- ✅ Scrollable pour voir tout l'historique

### 2. ⚠️ Capture Erreurs - Détection automatique
- ✅ Capture toutes les erreurs JavaScript
- ✅ Imports ES6 qui échouent
- ✅ Fonctions manquantes ou undefined
- ✅ Promesses rejetées (unhandled rejections)

### 3. 🧪 Tests Modules - Vérification au chargement
- ✅ Teste si app.js se charge
- ✅ Teste si state.js exporte bien les fonctions
- ✅ Teste si counters.js est fonctionnel
- ✅ Vérifie charts.js et Chart.js

### 4. 🎯 Vérification DOM - IDs et éléments
- ✅ Liste les 89 IDs manquants dans le HTML
- ✅ Vérifie les boutons +/-
- ✅ Teste les zones d'affichage (date, heure, compteurs)
- ✅ Valide la structure Stats (classe .stats, IDs KPI)

### 5. 💾 localStorage - État des données
- ✅ Affiche les clés présentes
- ✅ Teste la validité du JSON
- ✅ Montre les valeurs actuelles
- ✅ Détecte les corruptions de données

### 6. 📤 Export - Rapport détaillé
- ✅ Copie rapport → clipboard
- ✅ Téléchargement fichier .txt
- ✅ Sauvegarde auto dans localStorage (50 dernières erreurs)

---

## 📦 Installation

### Sur StopAddict

1. **Téléchargez `debug.js`** depuis ce repository

2. **Ajoutez dans `index.html` AVANT tous les autres scripts :**
```html
<!-- Avant tous les autres scripts -->
<script src="./js/debug.js"></script>
<!-- Le reste -->
<script src="./js/vendor/chart.umd.min.js"></script>
<script type="module" src="./js/app.js"></script>
```

3. **Activation :**
   - Sur mobile : 5 taps rapides sur le header de l'app
   - Via localStorage : `localStorage.setItem('SA_DEBUG', 'true')`

---

## 🚀 Utilisation

### Activation du mode debug

#### Méthode 1 : 5 taps sur le header
1. Ouvrir StopAddict
2. Taper 5 fois rapidement sur le titre "🚭 StopAddict"
3. La console debug apparaît

#### Méthode 2 : Via localStorage
```javascript
// Dans la console navigateur (F12) ou via snippet
localStorage.setItem('SA_DEBUG', 'true');
location.reload();
```

### Lire le rapport

La console affiche automatiquement :
```
┌─────────────────────────────────┐
│  DEBUG STOPADDICT v1.0          │
├─────────────────────────────────┤
│ MODULES                         │
│ ✅ app.js chargé (120ms)        │
│ ❌ state.js : ERREUR            │
│ → getAggregates manquant        │
│ ✅ counters.js chargé (45ms)    │
│                                 │
│ DOM (IDs)                       │
│ ✅ #date-actuelle trouvé        │
│ ❌ #heure-actuelle ABSENT       │
│                                 │
│ LOCALSTORAGE                    │
│ ✅ sa_daily_v1 (12 jours)       │
│ ❌ sa_limits_v1 : JSON invalide │
│                                 │
│ ERREURS JS (3)                  │
│ [12:34:56] state.js:245         │
│ Cannot read 'getAggregates'     │
└─────────────────────────────────┘
```

### Exporter le rapport

1. Cliquer sur **"Copier rapport"** → Copie dans le clipboard
2. Cliquer sur **"Télécharger .txt"** → Télécharge un fichier
3. Envoyer au développeur pour diagnostic

---

## 📊 Ce qui est testé

| Catégorie | Quantité testée |
|-----------|-----------------|
| IDs HTML | 89 IDs |
| Modules JS | 13 modules |
| Exports state.js | 24 fonctions |
| Clés localStorage | 5 clés |
| Event listeners | Tous les boutons +/- |

---

## 🗂️ Structure du projet
```
stopaddict-debug-tool/
├── debug/
│   ├── debug.js              ⭐ Script principal
│   ├── debug-ui.js           Interface overlay
│   ├── debug-logger.js       Système logs
│   ├── debug-modules.js      Tests modules JS
│   ├── debug-dom.js          Tests IDs HTML
│   └── debug-storage.js      Tests localStorage
├── config/
│   ├── ids-list.json         Liste 89 IDs
│   ├── modules-list.json     Liste modules + exports
│   └── localStorage-keys.json Clés localStorage
├── utils/
│   ├── validator.js          Validation concordance
│   ├── reporter.js           Génération rapports
│   └── exporter.js           Export TXT/JSON
├── scripts/
│   ├── check-concordance.js  ✅ Vérif fichiers
│   ├── validate-ids.js       ✅ Vérif IDs
│   └── validate-modules.js   ✅ Vérif modules
└── docs/
    ├── API.md
    ├── TROUBLESHOOTING.md
    └── EXAMPLES.md
```

---

## 🛠️ Développement

### Scripts npm
```bash
# Vérifier la concordance des fichiers
npm run check

# Valider les IDs
npm run validate:ids

# Valider les modules
npm run validate:modules

# Générer rapport complet
npm run report

# Tout tester
npm test
```

---

## 🔒 Sécurité et Confidentialité

- ✅ Aucune donnée personnelle dans les logs
- ✅ Pas d'envoi automatique sur internet
- ✅ Stockage local uniquement
- ✅ Désactivation facile (1 clic)
- ✅ Mode production = debug off par défaut

---

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

Créé avec ❤️ pour faciliter le développement mobile de **StopAddict**

---

## 🔗 Liens utiles

- [StopAddict Repository](https://github.com/votre-username/stopaddict-main)
- [Documentation complète](./docs/)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Examples](./docs/EXAMPLES.md)

---

**⚡ Status:** 🚧 En développement actif
