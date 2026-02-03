# ⚖️ Analyseur de Documents Judiciaires (DOJ Forensic)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)

**Analyseur de Documents Judiciaires** est une plateforme forensic de pointe conçue pour explorer, extraire et synthétiser les divulgations complexes du Département de la Justice (DOJ). Propulsé par l'IA (Gemini 2.5 via OpenRouter), l'outil transforme des archives et documents judiciaires denses en une base de données structurée, visuelle et interrogeable en temps réel.

> "Transformer le chaos documentaire en preuves structurées."

---

## 🌟 Fonctionnalités Clés

- **🕵️ Extraction Forensique IA** : Analyse automatique des sources pour extraire les faits, dates, entités et implications juridiques complexes.
- **🌐 Visualisation de Réseaux** : Graphe interactif pour identifier les connexions entre individus, organisations et lieux.
- **⏳ Analyse Temporelle** : Timeline chronologique pour reconstituer les fils des événements.
- **🤖 Assistant Intelligent** : Chat contextuel capable de répondre à des questions précises sur la base de données indexée.
- **💾 Architecture Local-First** : Persistance ultra-rapide via IndexedDB avec synchronisation optionnelle vers **Supabase**.
- **📁 Gestion Multitâche** : Système d'onglets permettant de mener plusieurs investigations de front.
- **📤 Export Professionnel** : Exportation des analyses au format JSON (support PDF/CSV à venir).

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Vite.
- **Styling** : Tailwind CSS (Design Premium Lab Dark Mode).
- **Intelligence Artificielle** : OpenRouter API (Moteur : Gemini 2.5 Flash Lite).
- **Base de Données** : IndexedDB (`idb`) + Supabase (Remote Sync).
- **Visualisation** : `react-force-graph-2d`.
- **Icons** : Lucide React.

---

## 📦 Installation & Configuration

### Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- Clé API [OpenRouter](https://openrouter.ai/)
- Projet [Supabase](https://supabase.com/) (Optionnel pour le cloud sync)

### Guide de démarrage rapide

1. **Clonez le projet**
   ```bash
   git clone https://github.com/votre-compte/Analyseur-de-Documents-Judiciaires.git
   cd Analyseur-de-Documents-Judiciaires
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   VITE_OPENROUTER_API_KEY=votre_cle_ici
   # Optionnel :
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

4. **Lancez l'application**
   ```bash
   npm run dev
   ```
   *Accédez à `http://localhost:5173` (ou le port affiché par Vite).*

---

## 📂 Documentation Complète

Pour approfondir vos connaissances sur le projet, consultez les guides suivants :

- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** : Schémas techniques et fonctionnement du système.
- 🗄️ **[DB_SCHEMA.md](./DB_SCHEMA.md)** : Structure des données Supabase et IndexedDB.
- 🔌 **[API_DOCS.md](./API_DOCS.md)** : Référence des services et intégrations IA.
- 🗺️ **[ROADMAP.md](./ROADMAP.md)** : Évolutions futures et backlog.
- 🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** : Comment participer au développement.

---

## 🏛️ Structure du Projet

```text
├── components/       # UI atomique et modules de visualisation
├── services/         # Orchestration API, IA et Storage
├── types.ts          # Définitions strictes TypeScript
├── constants.ts      # Configuration des prompts forensiques
├── App.tsx           # Chef d'orchestre de l'application
├── index.css         # Design system et thèmes premium
└── ...
```

---

## ⚙️ Variables d'Environnement

| Variable | Description | Obligatoire |
| :--- | :--- | :--- |
| `VITE_OPENROUTER_API_KEY` | Clé pour l'analyse IA | **Oui** |
| `VITE_SUPABASE_URL` | Endpoint de votre base Supabase | Non |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Non |

---

## ⚖️ Licence

Distribué sous la licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

Développé pour la recherche de vérité et la clarté judiciaire. 🕵️‍♂️⚖️
