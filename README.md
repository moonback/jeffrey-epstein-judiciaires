# ⚖️ Analyseur de Documents Judiciaires (DOJ Forensic)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC.svg)](https://tailwindcss.com/)

**DOJ Forensic** est une plateforme forensic de pointe conçue pour explorer, extraire et synthétiser les divulgations complexes du Département de la Justice (DOJ). Propulsé par l'IA (Gemini via OpenRouter), l'outil transforme des archives et documents judiciaires denses en une base de données structurée, visuelle et interrogeable en temps réel.

> "Transformer le chaos documentaire en preuves structurées et exploitables."

---

## 🌟 Fonctionnalités Clés

- **🕵️ Extraction Forensique IA** : Analyse automatique des sources pour extraire les faits, dates, entités et implications juridiques complexes.
- **🌐 Cartographie de Réseau (Neural Graph)** : Graphe interactif 2D pour identifier les connexions entre individus, organisations et flux financiers.
- **📊 Chronologie Temporelle (Timeline)** : Vue chronologique avancée permettant de reconstituer la séquence précise des événements.
- **💰 Traçabilité Financière** : Module dédié à l'analyse des flux monétaires et du patrimoine (Assets).
- **🤖 Assistant Live & Vocal** : Co-pilote intelligent capable de répondre aux questions complexes et de naviguer via commandes vocales.
- **💾 Architecture Local-First** : Persistance ultra-rapide via IndexedDB avec synchronisation optionnelle vers **Supabase**.
- **📁 Gestion Multitâche** : Système d'onglets de laboratoire permettant de mener plusieurs investigations simultanément.
- **📥 Dossier Archive Epstein** : Accès direct et indexé aux divulgations spécifiques concernant l'affaire Jeffrey Epstein.

---

## 🛠️ Stack Technique

- **Core** : React 19, TypeScript, Vite.
- **Styling** : Tailwind CSS 4 (Theme Luxury Forensic / Dark Mode).
- **Intelligence Artificielle** : 
  - **Models** : Gemini 2.0 Flash / Pro (via OpenRouter).
  - **Vision/OCR** : Tesseract.js & PDF.js pour l'analyse de documents scannés.
- **Base de Données** : IndexedDB (`idb`) pour le cache local + Supabase pour la persistance Cloud.
- **Visualisation** : `react-force-graph-2d` (Graphes de relations).
- **Export** : `jspdf`, `jspdf-autotable` (Génération de rapports PDF).

---

## 📦 Installation & Configuration

### Prérequis
- **Node.js** (v18.0.0+)
- **NPM** (v9.0.0+)
- Une clé API **OpenRouter** (pour l'intelligence artificielle)
- Un projet **Supabase** (optionnel, pour la synchronisation cloud)

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
   # Optionnel pour la persistance Cloud :
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

4. **Lancez le serveur de développement**
   ```bash
   npm run dev
   ```
   *Accédez à `http://localhost:5173`.*

---

## 📂 Documentation Complète

- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** : Schémas techniques et flux de données.
- 🔌 **[API_DOCS.md](./API_DOCS.md)** : Référence des services IA et stockage.
- 🗺️ **[ROADMAP.md](./ROADMAP.md)** : Prochaines étapes et backlog.
- 🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** : Guide pour les contributeurs.
- 🗄️ **[DB_SCHEMA.md](./DB_SCHEMA.md)** : Structure détaillée des données.

---

## 🏛️ Structure du Projet

```text
├── components/       # Composants UI React (Vues, Cartes, Modales)
├── services/         # Logique métier (IA, Storage, Export, OCR)
├── public/           # Assets statiques et archives PDF
├── types.ts          # Interfaces TypeScript globales
├── constants.ts      # Configuration des prompts et constantes
├── index.css         # Thème global et design system
└── App.tsx           # Routeur et état global de la session
```

---

## ⚙️ Variables d'Environnement

| Variable | Description | Requis |
| :--- | :--- | :--- |
| `VITE_OPENROUTER_API_KEY` | Clé API pour les modèles LLM (Gemini/Claude) | **OUI** |
| `VITE_SUPABASE_URL` | Endpoint API de votre projet Supabase | Non |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase | Non |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour connaître les standards de codage et le processus de soumission de Pull Request.

---

## ⚖️ Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

*Développé pour la transparence judiciaire et l'analyse forensique de données publiques.* 🕵️‍♂️⚖️
