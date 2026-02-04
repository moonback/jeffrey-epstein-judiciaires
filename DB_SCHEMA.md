# 🗄️ Schéma de la Base de Données

L'application **DOJ Forensic** utilise une stratégie de stockage hybride pour garantir performance locale et persistance globale.

---

## 1. IndexedDB (Couche Locale)

Le stockage local est le "Source of Truth" immédiat. Il est géré via la bibliothèque `idb`.

### Base : `doj_forensic_vector_store`

#### Object Store : `analysis_results`
Contient l'historique complet des investigations de l'utilisateur.

- **Clé primaire** : `id` (ex: `CASE-4821`)
- **Index** :
  - `by-date` : Trié sur `input.timestamp`.

**Structure d'un enregistrement :**
```json
{
  "id": "string",
  "status": "pending | processing | completed | error",
  "input": {
    "id": "string",
    "query": "string",
    "targetUrl": "string",
    "timestamp": "number",
    "fileContent": "string (optional)"
  },
  "output": {
    "context_general": "string",
    "documents": "Array<DocumentDetail>",
    "entites_cles": "Array<string>",
    "transactions_financieres": "Array<TransactionDetail>",
    "contexte_juridique": "string"
  },
  "logs": "Array<string>",
  "sources": "Array<{title, uri}>",
  "durationMs": "number",
  "timestamp": "number"
}
```

---

## 2. Supabase (Couche Remote)

Supabase est utilisé pour la synchronisation persistante et, à terme, la collaboration.

### Table : `analysis_results`

| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT` (PK) | Identifiant unique de l'analyse |
| `status` | `TEXT` | État du traitement |
| `input` | `JSONB` | Copie de l'objet input |
| `output` | `JSONB` | Copie de l'objet output (analyse IA) |
| `logs` | `JSONB` | Historique des logs système |
| `sources` | `JSONB` | Sources documentaires |
| `duration_ms`| `INTEGER` | Latence de traitement |
| `created_at` | `TIMESTAMPTZ` | Horodatage automatique |

---

## 3. Flux de Synchronisation

1. **Écriture** : Toute nouvelle analyse est immédiatement écrite dans **IndexedDB**.
2. **Synchronisation** : Une fois écrite localement, le `storageService` tente un `upsert` (mise à jour ou insertion) vers Supabase.
3. **Récupération** : Au chargement de l'application, les données locales sont chargées, puis fusionnées avec les données récupérées depuis Supabase pour garantir que l'utilisateur retrouve son travail sur un nouvel appareil.

---

## 4. SQL d'Initialisation (Supabase)

Pour configurer une nouvelle instance Supabase compatible, exécutez ce script dans l'éditeur SQL de votre dashboard :

```sql
-- Création de la table principale
CREATE TABLE analysis_results (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB,
  logs JSONB,
  sources JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la Row Level Security (RLS)
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Politique d'accès public (Initialisation/Dev)
-- À resserrer en production avec auth.uid()
CREATE POLICY "Allow public all access" ON analysis_results FOR ALL USING (true);
```
