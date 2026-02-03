# 🗺️ Roadmap du Projet

Ce document trace les étapes de développement de l'**Analyseur de Documents Judiciaires**, du MVP actuel vers une suite forensic complète.

---

## ✅ Phase 1 : MVP (Actuel)
- [x] Interface de laboratoire (Investigation Tabs).
- [x] Intégration OpenRouter (Gemini / Grok).
- [x] Extraction JSON structurée.
- [x] Stockage persistant IndexedDB.
- [x] Dashboard global des résultats.
- [x] Assistant interactif (Live Chat).

---

## 🛠️ Phase 2 : Optimisation & Analyse (V1.0)
- [ ] **Recherche Vectorielle (RAG)** : Implémenter des embeddings locaux pour une recherche sémantique plus puissante dans la base.
- [ ] **Visualisation de Graphe** : Créer une vue interactive reliant les entités (personnes, lieux, entreprises) entre les différents documents.
- [ ] **Support Multi-Sources** : Permettre d'ajouter ses propres PDF ou URLs à analyser en plus du site du DOJ.
- [ ] **Gestion des Proxy** : Ajouter une option dans l'UI pour configurer un proxy de recherche (Google Search API / Tavily).

---

## 🚀 Phase 3 : Fonctionnalités Avancées (V2.0)
- [ ] **Analyse de Sentiment & Contradiction** : Automatiquement détecter les contradictions entre deux dépositions.
- [ ] **Timeline Interactive** : Générer une frise chronologique automatique à partir de tous les documents indexés.
- [ ] **Collaboration** : Export/Import de "Bundles" d'investigation pour partager ses recherches avec d'autres enquêteurs.
- [ ] **OCR Intégré** : Support pour les scans de mauvaise qualité via une couche OCR.

---

## 🎯 Objectif Final
Devenir l'outil de référence open-source pour l'analyse citoyenne des divulgations de documents gouvernementaux massifs.
