import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProcessedResult } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface ForensicVectorDB extends DBSchema {
  analysis_results: {
    key: string;
    value: ProcessedResult;
    indexes: { 'by-date': number };
  };
  epstein_file_metadata: {
    key: string;
    value: {
      path: string;
      file_type?: 'doc' | 'image';
      is_selected: boolean;
      updated_at: string;
    };
  };
}

const DB_NAME = 'doj_forensic_vector_store';
const STORE_NAME = 'analysis_results';

class StorageService {
  private dbPromise: Promise<IDBPDatabase<ForensicVectorDB>>;

  constructor() {
    this.dbPromise = openDB<ForensicVectorDB>(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-date', 'input.timestamp');
        }
        if (!db.objectStoreNames.contains('epstein_file_metadata')) {
          db.createObjectStore('epstein_file_metadata', { keyPath: 'path' });
        }
      },
    });
  }

  async saveResult(result: ProcessedResult): Promise<void> {
    // 1. Save to Local IndexedDB (Always)
    const db = await this.dbPromise;
    await db.put(STORE_NAME, result);
    console.log(`[Local Storage] Saved ${result.id}`);

    // 2. Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('analysis_results')
          .upsert({
            id: result.id,
            status: result.status,
            input: result.input,
            output: result.output,
            logs: result.logs,
            sources: result.sources,
            duration_ms: Math.round(result.durationMs),
            created_at: new Date(result.input.timestamp).toISOString()
          });

        if (error) throw error;
        console.log(`[Supabase Remote] Synced ${result.id}`);
      } catch (e) {
        console.error('[Supabase Sync Error]', e);
      }
    }
  }

  async getAllResults(): Promise<ProcessedResult[]> {
    const db = await this.dbPromise;
    const localResults = await db.getAllFromIndex(STORE_NAME, 'by-date');
    const localMap = new Map(localResults.map(r => [r.id, r]));

    // If Supabase not configured, return local immediately
    if (!isSupabaseConfigured || !supabase) {
      return localResults;
    }

    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const remoteResults = data.map(item => ({
          id: item.id,
          status: item.status,
          input: item.input,
          output: item.output,
          logs: item.logs,
          sources: item.sources,
          durationMs: item.duration_ms || 0
        } as ProcessedResult));

        // Merge logic: Remote overwrites local if same ID, 
        // but we keep local-only investigations
        for (const r of remoteResults) {
          localMap.set(r.id, r);
        }

        // Persistence: Update local DB with any remote items it's missing
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const r of remoteResults) {
          await tx.store.put(r);
        }
        await tx.done;
      }
    } catch (e) {
      console.warn('[Supabase Fetch Error] Using local IDB only', e);
    }

    // Convert map back to array and sort by timestamp
    return Array.from(localMap.values()).sort((a, b) => a.input.timestamp - b.input.timestamp);
  }

  async getResult(id: string): Promise<ProcessedResult | undefined> {
    const db = await this.dbPromise;
    return await db.get(STORE_NAME, id);
  }

  async deleteResult(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
    console.log(`[Local Storage] Deleted ${id}. Remote preserved.`);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
    await db.clear('epstein_file_metadata');
    console.log(`[Local Storage] Workspace cleared. Remote preserved.`);
  }

  async saveFileMetadata(path: string, metadata: { type?: 'doc' | 'image', selected?: boolean }): Promise<void> {
    const db = await this.dbPromise;
    const existing = await db.get('epstein_file_metadata', path);

    const entry = {
      path,
      file_type: metadata.type !== undefined ? metadata.type : existing?.file_type,
      is_selected: metadata.selected !== undefined ? metadata.selected : (existing?.is_selected || false),
      updated_at: new Date().toISOString()
    };

    await db.put('epstein_file_metadata', entry);
    console.log(`[Local Metadata] Saved for ${path}`, entry);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('epstein_file_metadata')
          .upsert(entry, { onConflict: 'path' }); // Explicit onConflict

        if (error) throw error;
        console.log(`[Supabase Metadata] Synced ${path}`);
      } catch (e) {
        console.error('[Supabase Metadata Sync Error]', e);
      }
    }
  }

  async getAllFileMetadata(): Promise<any[]> {
    const db = await this.dbPromise;
    const local = await db.getAll('epstein_file_metadata');
    console.log(`[Local Metadata] Loaded ${local.length} items`);

    if (!isSupabaseConfigured || !supabase) {
      return local;
    }

    try {
      console.log('[Supabase Metadata] Fetching from remote...');
      const { data, error } = await supabase
        .from('epstein_file_metadata')
        .select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`[Supabase Metadata] Received ${data.length} items from remote`);
        const tx = db.transaction('epstein_file_metadata', 'readwrite');
        for (const item of data) {
          await tx.store.put(item);
        }
        await tx.done;
        return data;
      }
    } catch (e) {
      console.warn('[Supabase Metadata Fetch Error] Using local only', e);
    }

    return local;
  }
}

export const storageService = new StorageService();
