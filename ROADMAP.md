# 🗺️ Roadmap : DOJ Forensic Analyzer

Ce document trace l'évolution de la plateforme, depuis son état actuel de MVP jusqu'à une suite forensique complète et collaborative.

---

## ✅ Phase 1 : MVP & Fondations (Terminé)
- [x] Infrastructure React 19 / Vite réactive.
- [x] Moteur d'analyse IA via OpenRouter (Gemini 2.0).
- [x] Stockage Local-First avec IndexedDB.
- [x] Interface de laboratoire à onglets.
- [x] Visualisation des résultats via "Data Cards".
- [x] Assistant interactif (Live Assistant).

## 🚧 Phase 2 : Visualisation Avancée (En cours)
- [x] **Neural Network Graph** : Graphe de relations dynamique entre entités.
- [x] **Timeline Engine** : Chronologie interactive des événements et documents.
- [x] **Financial Flow Tracker** : Extraction et visualisation des flux monétaires.
- [x] **Archives Epstein** : Module dédié à l'exploration du dataset de divulgations.
- [x] **Analyse Multimodale** : Support OCR pour les PDF scannés via Tesseract.js.

## 🚀 Phase 3 : V1.0 - Outils Forensiques Professionnels (Q1 2026)
- [ ] **Export Suite Pro** : Génération de rapports PDF complexes, CSV pour Excel, et Markdown.
- [ ] **Cross-Document Discovery** : Algorithme pour identifier automatiquement des liens entre deux documents analysés séparément.
- [ ] **Mode Collaboration** : Espaces de travail partagés (Shared Workspaces) via Supabase.
- [ ] **Agent Backup** : Sauvegarde granulaire des traces de raisonnement des agents IA.

## 🔮 Phase 4 : Vision Long Terme
- [ ] **Fine-tuning Juridique** : Entraînement d'un modèle spécifique aux terminologies judiciaires du DOJ.
- [ ] **OSINT Integration** : Corrélation automatique entre les documents DOJ et les fuites de données (leaks) ou archives du Dark Web.
- [ ] **Analyse Audio/Vidéo** : Transcription et analyse forensique des enregistrements d'audiences.
- [ ] **API Publique** : Permettre à des tiers de requêter la base de données indexée.

---

## 📈 Priorités Actuelles
1.  **Fiabilité de l'extraction** : Améliorer les prompts pour éliminer les hallucinations sur les dates et montants.
2.  **Performance du Graphe** : Optimisation du rendu pour les dossiers contenant plus de 200 entités.
3.  **UI/UX Mobile** : Rendre les outils complexes (Graphe/Timeline) pleinement utilisables sur tablette et mobile.

---

*Dernière mise à jour : Février 2026*
