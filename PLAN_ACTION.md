# Plan d'Action Technique : Optimisation & Sécurisation DOJ Forensic

## 1. Diagnostic Critique (Bug & Performance)

### A. Gestion de la Queue (Memory Leaks)
Le système actuel utilise une double gestion `queueRef` (mutable) et `queue` (State). 
**Problème :** Le `setTimeout(processItem, 2500)` ne possède pas de mécanisme de nettoyage. Si l'utilisateur quitte la page ou ferme un onglet, le processus continue en arrière-plan et tente de mettre à jour un état démonté.
**Solution :** Utiliser un `useEffect` avec un `AbortController` et un `Ref` pour le flag `isProcessing`.

### B. Robustesse du Parsing JSON
Le regex actuel `text.replace(/```json/g, '').replace(/```/g, '')` est fragile. Si l'IA ajoute du texte de transition ("Voici le JSON..."), le `JSON.parse` échouera.
**Solution :** Extraction sélective via un regex de "bloc" `{...}`.

### C. Sécurité (API Keys)
L'exposition de `VITE_OPENROUTER_API_KEY` dans le bundle client est un risque de sécurité majeur (vol de crédits).
**Solution :** Migration vers **Supabase Edge Functions**. Le client appelle Supabase, qui injecte la clé API (secret) et appelle OpenRouter.

---

## 2. Optimisation React 19 & Local-First

### A. React 19 Hooks
- **`useActionState`** : Pour gérer l'état de soumission du formulaire d'investigation (loading, data, error) de manière native.
- **`useOptimistic`** : Pour afficher instantanément l'analyse dans la liste des onglets avant même que le traitement IDB/AI ne soit terminé.

### B. Synchronisation Robuste (Sync-Orchestrator)
Pour éviter les doublons entre IndexedDB et Supabase :
- Implémenter un `sync_status` ('pending', 'synced', 'error') sur chaque entrée.
- Utiliser un identifiant unique (UUID v4) généré côté client.
- Développer un hook `useSync` qui surveille les changements IDB et "push" vers Supabase avec un `upsert`.

---

## 3. Nouvelles Fonctionnalités (Forensic & OSINT)

### A. Module de Contradiction
Logique : Comparer les `key_facts` et `dates` extraits de deux documents.
```typescript
async function detectInconsistencies(docA: ProcessedResult, docB: ProcessedResult) {
   // Prompt spécialisé envoyé à Gemini 2.5 Flash Lite
}
```

### B. Analyse de Graphe Avancée
Coloration par niveau de risque :
- **Node Risk (1-10)** : Dégradé du Bleu (Témoin) au Rouge (Cible Prioritaire).
- **Influence** : Taille du noeud basée sur le nombre de connexions (PageRank simplifié).

### C. Support PDF Natif
Intégration de `pdfjs-dist` pour transformer les PDFs en texte brut avant l'envoi, réduisant ainsi les frais de tokens et améliorant la précision de Gemini.

---

## 4. Amélioration des Prompts

Optimisation de `SYSTEM_INSTRUCTION_DISCLOSURE` :
- Ajout d'une règle "No Hallucination" : "Si une information n'est pas explicitement dans le texte, marquez [NON MENTIONNÉ]".
- Forcer l'extraction des métadonnées juridiques (ex: "Bates Numbering").
