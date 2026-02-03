# 🕵️‍♂️ Analyseur de Documents Judiciaires (DOJ Epstein Disclosures)

> **Une interface forensique alimentée par l'IA pour l'analyse, l'extraction et la synthèse en temps réel des documents juridiques complexes.**

Ce projet est une application web React (Single Page Application) conçue pour aider les chercheurs et les enquêteurs à naviguer dans les divulgations massives de documents (spécifiquement le dossier Epstein du DOJ). Elle utilise **Google Gemini 3 Flash** avec Grounding (Google Search) pour extraire des faits, identifier des entités et vulgariser des contenus juridiques denses.

![Status](https://img.shields.io/badge/Status-Beta-orange) ![Stack](https://img.shields.io/badge/Tech-React%20%7C%20Gemini%20API%20%7C%20Tailwind-blue)

## ✨ Fonctionnalités Principales

*   **🔍 Analyse Forensique Automatisée :** Traitement par lots de requêtes prédéfinies pour extraire des faits clés, des dates et des implications juridiques.
*   **🧠 Deep Dive (Analyse Approfondie) :** Reformulation à la demande des documents selon trois modes : *Simple (Vulgarisation)*, *Technique (Juridique)*, ou *Standard*.
*   **🕸️ Profilage d'Entités :** Système interactif permettant de cliquer sur n'importe quel nom (personne ou organisation) pour lancer une enquête contextuelle spécifique.
*   **💬 Assistant Live "Forensic" :** Un chatbot contextuel capable d'interroger spécifiquement le domaine `justice.gov` pour répondre à des questions précises (ex: "Page X de la déposition Y").
*   **💾 Persistance Locale :** Sauvegarde automatique de l'historique d'analyse dans le navigateur (LocalStorage) et export des rapports au format JSON.
*   **⚡ Interface Réactive :** Design sombre type "Terminal/Dashboard" optimisé pour la lecture de données denses.

## 🛠️ Stack Technique

*   **Frontend :** React 19, TypeScript
*   **Styling :** Tailwind CSS, Lucide React (Icônes)
*   **IA & Backend Logic :** Google Gemini API (`gemini-3-flash-preview`) via `@google/genai` SDK.
*   **Build Tool :** Vite (Recommandé) ou Create React App.

## 🚀 Installation et Configuration

### Prérequis

*   Node.js (v18+)
*   NPM ou Yarn
*   Une clé API Google AI Studio (avec accès aux modèles `gemini-3-flash-preview`).

### 1. Cloner le projet

```bash
git clone https://github.com/votre-user/doj-analyzer.git
cd doj-analyzer
