# 🔌 API Documentation & Services

This project primarily acts as an orchestrator between the user, **OpenRouter AI**, and **Supabase**. There is no custom backend; all logic resides in the `services/` layer.

## 1. AI Integration (OpenRouter)
All AI interactions go through `openRouterService.ts`.

### `mergeDataWithFlash(input: InputData)`
The main analysis engine.
- **Input**: `InputData` object containing `query` and `targetUrl`.
- **Model**: `google/gemini-2.5-flash-lite` (via OpenRouter).
- **Process**: 
  1. Sends a structured prompt with system instructions.
  2. Retries on 429/503 errors (exponential backoff).
  3. Parses and cleans the JSON output.
- **Output**: Returns structured `DisclosureAnalysis`, `logs`, and `sources`.

### `askAssistant(history, message)`
The interactive chat assistant.
- **History**: Array of `{ role, text }`.
- **Message**: User's latest question.
- **Context**: Injected system instructions for legal forensic specialization.

---

## 2. Storage Service (Local & Remote)
Managed via `storageService.ts`.

### `saveResult(result: ProcessedResult)`
- **Local**: Persists to IndexedDB.
- **Sync**: Upserts to Supabase table `analysis_results`.

### `getAllResults()`
- Loads from local IndexedDB.
- Fetches from Supabase.
- Merges data (Local + Remote).
- Sorts by timestamp.

### `deleteResult(id)`
- Deletes from Local IndexedDB only (Remote preservation by design).

---

## 3. External API Dependencies

### OpenRouter API
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Auth**: Bearer Token (`VITE_OPENROUTER_API_KEY`)
- **Headers**:
  - `HTTP-Referer`: Site URL.
  - `X-Title`: App Name.

### Supabase API
- **URL**: `VITE_SUPABASE_URL`
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **SDK**: `@supabase/supabase-js`

---

## 4. Expected AI Output Format (JSON)
The AI is instructed to return a JSON object following this interface (from `types.ts`):

```typescript
export interface DisclosureAnalysis {
  entities: {
    name: string;
    type: string;
    role: string;
    details: string;
  }[];
  facts: {
    date: string;
    event: string;
    context: string;
    relevance: "high" | "medium" | "low";
  }[];
  implications: {
    category: string;
    description: string;
    legal_context: string;
  }[];
  summary: string;
}
```
