# ⚖️ Analyseur de Documents Judiciaires (DOJ Forensic)

**Analyseur de Documents Judiciaires** est une plateforme forensic de pointe conçue pour explorer, extraire et synthétiser les divulgations complexes du Département de la Justice (DOJ) concernant l'affaire Epstein. Propulsé par Gemini 2.0 Flash (via OpenRouter), l'outil transforme des archives PDF denses en une base de données structurée et interrogeable en temps réel.

---

## 🚀 Fonctionnalités Clés (MVP)

- **🕵️ Extraction Forensique Automatisée** : Analyse programmatique des sources du DOJ pour extraire les faits, dates, entités et implications juridiques.
- **📊 Base de Données Vectorielle Locale** : Stockage persistant des résultats dans le navigateur via IndexedDB pour une consultation hors-ligne et rapide.
- **📁 Interface Multitâche par Onglets** : Gérez plusieurs investigations simultanément avec une interface fluide inspirée des IDE professionnels.
- **🤖 Assistant Live Contextuel** : Chat interactif capable de répondre à des questions précises sur les documents indexés.
- **🔍 Database Globale** : Vue agrégée de tous les documents extraits avec recherche plein texte et filtrage par catégorie.
- **📤 Export JSON Portable** : Exportez vos découvertes au format standard pour des analyses externes.

---

## 🛠️ Stack Technique

- **Frontend** : [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool** : [Vite 6](https://vitejs.dev/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) + CSS Vanilla (Design Premium Dark Mode)
- **Intelligence Artificielle** : [OpenRouter API](https://openrouter.ai/) (Moteur par défaut : Google Gemini 2.0 Flash Lite)
- **Base de Données** : [IndexedDB](https://developer.mozilla.org/fr/docs/Web/API/IndexedDB_API) avec la library [idb](https://www.npmjs.com/package/idb)
- **Icons** : [Lucide React](https://lucide.dev/)

---

## 📦 Installation & Configuration

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- Un compte [OpenRouter](https://openrouter.ai/) pour obtenir une clé API.

### Étapes d'installation

1. **Cloner le répertoire**
   ```bash
   git clone https://github.com/votre-compte/Analyseur-de-Documents-Judiciaires.git
   cd Analyseur-de-Documents-Judiciaires
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet et ajoutez votre clé OpenRouter :
   ```env
   VITE_OPENROUTER_API_KEY=votre_cle_sk_or_v1_...
   ```

---

## 🚀 Lancement

### Mode Développement
```bash
npm run dev
```
L'application sera disponible sur `http://localhost:3000`.

### Build Production
```bash
npm run build
```
Les fichiers optimisés seront générés dans le dossier `/dist`.

---

## 📂 Structure du Projet

```text
├── components/       # Composants UI (DataCard, ResultsDashboard, etc.)
├── services/         # Logique métier (OpenRouter, IndexedDB)
├── types.ts          # Définitions TypeScript
├── constants.ts      # Configuration des prompts et des requêtes
├── App.tsx           # Orchestrateur principal
├── index.tsx         # Point d'entrée React
├── index.html        # Template HTML & Injection Tailwind/Styles
├── .env              # Variables d'environnement (API Keys)
└── tsconfig.json     # Configuration TypeScript
```

---

## ⚙️ Variables d'Environnement

| Variable | Description | Requis |
| :--- | :--- | :--- |
| `VITE_OPENROUTER_API_KEY` | Clé API OpenRouter pour l'IA | Oui |

---

## 🤝 Contribution

1. Forkez le projet.
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`).
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`).
4. Pushez sur la branche (`git push origin feature/AmazingFeature`).
5. Ouvrez une Pull Request.

---

## ⚖️ Licence

Distribué sous la licence **MIT**. Voir `LICENSE` pour plus d'informations.
