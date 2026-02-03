# 🏗️ Architecture du Système

Ce document détaille l'organisation technique et le flux de données de l'**Analyseur de Documents Judiciaires**.

## 🧩 Modèle d'Architecture

L'application suit une architecture **Client-Side Heavy** (Single Page Application) avec une persistance locale et une orchestration d'API externe.

### 1. Frontend (Interface & UX)
- **Framework** : React 19 gère l'état réactif.
- **Gestionnaire d'État** : Utilisation de `useState` et `useRef` pour la file d'attente d'indexation (Queue Management).
- **Paradigme de Design** : Système d'onglets (Multi-session) permettant d'isoler chaque requête d'analyse.

### 2. Couche de Service IA (OpenRouter)
- **Service** : `openRouterService.ts`
- **Rôle** : Encapsule les appels `fetch` vers OpenRouter.
- **Logique** : 
  - Nettoyage des sorties Markdown de l'IA pour garantir un JSON valide.
  - Système de Retry exponentiel pour gérer les Rate Limits des modèles gratuits/beta.

### 3. Persistance des Données (Local Storage 2.0)
- **Technologie** : IndexedDB (via la library `idb`).
- **Service** : `storageService.ts`
- **Flux** : 
  1. L'utilisateur lance une investigation.
  2. Un objet temporaire est créé dans l'état local.
  3. Une fois l'IA répondue, le résultat complet (`ProcessedResult`) est sauvegardé dans IndexedDB.
  4. Au rechargement de la page, l'historique est restauré depuis la DB locale.

### 4. Flux de Données (Data Flow)
```text
[Utilisateur] -> [Requête] -> [File d'attente] 
                                    |
                          [OpenRouter Service] <-> [LLM (Gemini/Grok)]
                                    |
                          [Traitement JSON & Nettoyage]
                                    |
            [IndexedDB Store] <--- [Mise à jour UI]
```

## 🔐 Sécurité & Confidentialité
- **Clés API** : Les clés sont stockées dans `.env` et ne sont jamais commitées.
- **Données** : Toutes les analyses restent dans le navigateur de l'utilisateur. Aucune donnée n'est stockée sur nos serveurs (architecture 100% locale).
