# 🔌 Documentation des Services & API

L'application **DOJ Forensic** fonctionne comme un orchestrateur orchestrant les interactions entre l'utilisateur, les modèles LLM et les systèmes de stockage.

---

## 1. Intelligence Artificielle (OpenRouter Service)

Le service `openRouterService.ts` est le cœur analytique de l'application.

### Méthodes Principales

#### `mergeDataWithFlash(input: InputData)`
Analyse un document ou une requête complexe.
- **Récupération** : Utilise `google/gemini-2.0-flash-lite-preview-02-05` par défaut.
- **Payload** : Envoie le contenu du document (`fileContent`) et la requête utilisateur.
- **Prompting** : Utilise le `SYSTEM_INSTRUCTION_DISCLOSURE` défini dans `constants.ts`.
- **Retour** : Un objet contenant :
  - `json`: Données structurées (`DisclosureAnalysis`).
  - `logs`: Trace des étapes de l'agent.
  - `sources`: Liens vers les documents originaux.

---

## 2. Persistance des Données (Storage Service)

Le service `storageService.ts` gère la dualité Local/Cloud.

### Opérations CRUD

- **`saveResult(result: ProcessedResult)`** :
  - Sauvegarde immédiate dans IndexedDB (`analysis_results`).
  - Synchronisation asynchrone avec la table Supabase `analysis_results`.
- **`getAllResults()`** :
  - Récupère les données locales.
  - Tente de récupérer les données distantes (Supabase) si le client est configuré.
  - Fusionne et dédoublonne les résultats.
- **`deleteResult(id: string)`** :
  - Supprime localement et sur Supabase si possible.

---

## 3. Schéma des Objets (Types TypeScript)

Les échanges entre les services et l'UI sont régis par les interfaces de `types.ts`.

### `ProcessedResult` (Wrapper de résultat)
```typescript
interface ProcessedResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  input: InputData;
  output: DisclosureAnalysis | null;
  logs: string[];
  sources: { title: string; uri: string }[];
  durationMs: number;
}
```

### `DisclosureAnalysis` (Output de l'IA)
L'IA est instruite pour toujours répondre selon ce schéma :
```typescript
interface DisclosureAnalysis {
  context_general: string;
  documents: {
    title: string;
    type: string;
    description: string;
    key_facts: string[];
    legal_implications: string;
    date: string;
  }[];
  entites_cles: string[];
  entites_details?: {
    nom: string;
    role: string;
    risk_level: number;
  }[];
  transactions_financieres?: {
    source: string;
    destination: string;
    montant: number;
    devise: string;
    date: string;
  }[];
  contexte_juridique: string;
}
```

---

## 4. Endpoints Externes

### OpenRouter API
- **URL** : `https://openrouter.ai/api/v1/chat/completions`
- **Authentification** : Bearer Token (`VITE_OPENROUTER_API_KEY`)
- **Headers requis** :
  - `HTTP-Referer` : URL du site
  - `X-Title` : `DOJ Forensic Analyzer`

### Supabase Rest API
- **URL** : `VITE_SUPABASE_URL`
- **Key** : `VITE_SUPABASE_ANON_KEY`
- **Table** : `analysis_results` (RLS activée recommandée)
