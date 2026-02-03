# 🗄️ Database Schema

The **Analyseur de Documents Judiciaires** uses a dual-layer storage strategy: a local cache for speed and offline availability, and a remote database for synchronization and persistence.

## 1. Supabase (Remote)
The remote database is used to persist investigations across sessions and devices.

### Table: `analysis_results`
Stores the results of AI investigations.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT` (PK) | Unique analysis identifier (e.g., `ANALYSE-123456`) |
| `status` | `TEXT` | Status: `processing`, `completed`, `error` |
| `input` | `JSONB` | Original query data (`id`, `query`, `targetUrl`, `timestamp`) |
| `output` | `JSONB` | Structured AI output (entities, facts, implications, etc.) |
| `logs` | `JSONB` | Array of forensic trace logs |
| `sources` | `JSONB` | List of source documents referenced |
| `duration_ms` | `INTEGER` | Time taken for analysis in milliseconds |
| `created_at` | `TIMESTAMPTZ` | Auto-generated timestamp |

---

## 2. IndexedDB (Local)
Local storage is managed via the `idb` library. It acts as a vector for the "Local-First" architecture.

### Object Store: `analysis_results`
Mirrors the Supabase table structure for immediate UI responsiveness.

- **DB Name**: `doj_forensic_vector_store`
- **Key Path**: `id`
- **Indexes**:
  - `by-date`: Indexed on `input.timestamp` for chronological sorting.

---

## 3. Data Flow & Sync Logic
1. **Creation**: When an investigation starts, a placeholder item is added to IndexedDB and the UI state.
2. **Analysis**: AI processes the request.
3. **Save**: The completed `ProcessedResult` is saved to IndexedDB first.
4. **Sync**: If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided, the service attempts an `upsert` to the Supabase `analysis_results` table.
5. **Load**: On application startup, the service fetches all results from Supabase, merges them with local IndexedDB data (remote wins in case of conflict), and populates the UI.

---

## 4. How to Initialize Supabase
To use the remote sync, run the following SQL in your Supabase SQL Editor:

```sql
-- Create the analysis_results table
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

-- Enable Row Level Security (RLS)
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions (Development mode)
-- Note: Replace with specific user policies for production
CREATE POLICY "Allow public access" ON analysis_results FOR ALL USING (true);
```
