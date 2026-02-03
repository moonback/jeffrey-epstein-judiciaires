# 📦 Documentation du Stockage Local (IndexedDB)

L'application utilise **IndexedDB** pour stocker les résultats d'analyses de manière persistante. Contrairement au `localStorage` classique, IndexedDB permet de stocker de grands volumes de données structurées.

## 🗄️ Schéma de la Base de Données

- **Nom de la DB** : `doj_forensic_vector_store`
- **Store** : `analysis_results`
- **Clé Primaire** : `id` (ex: `ANALYSE-123456-0`)

### Structure d'un Objet (Type `ProcessedResult`)

```json
{
  "id": "string",
  "status": "processing | completed | error",
  "input": {
    "id": "string",
    "query": "La requête de l'utilisateur",
    "targetUrl": "URL de référence",
    "timestamp": 1700000000000
  },
  "output": {
    "context_general": "Synthèse IA",
    "documents": [
      {
        "title": "Titre du document",
        "type": "Type (Email, Déposition...)",
        "description": "Résumé",
        "key_facts": ["Fait 1", "Fait 2"],
        "legal_implications": "Analyse",
        "date": "Date"
      }
    ],
    "entites_cles": ["Nom 1", "Nom 2"],
    "contexte_juridique": "Synthèse légale"
  },
  "logs": ["Tableau des étapes système"],
  "sources": [{ "title": "Source", "uri": "URL" }],
  "durationMs": 1500
}
```

## 🛠️ Méthodes Disponibles (StorageService)

L'accès à la DB se fait via `storageService.ts` :

| Méthode | Action |
| :--- | :--- |
| `saveResult(result)` | Ajoute ou met à jour une analyse. |
| `getAllResults()` | Récupère tout l'historique (trié par date). |
| `getResult(id)` | Récupère une analyse spécifique par son ID. |
| `deleteResult(id)` | Supprime une analyse spécifique. |
| `clearAll()` | Efface toute la base de données. |

## 🚀 Performance
Un index est créé sur `input.timestamp` pour permettre des tris rapides sans charger toute la base en mémoire lors de futures évolutions (pagination).
