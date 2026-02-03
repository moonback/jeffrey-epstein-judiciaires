import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProcessedResult } from '../types';
import { supabase } from './supabaseClient';

interface ForensicVectorDB extends DBSchema {
  analysis_results: {
    key: string;
    value: ProcessedResult;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'doj_forensic_vector_store';
const STORE_NAME = 'analysis_results';

class StorageService {
  private dbPromise: Promise<IDBPDatabase<ForensicVectorDB>>;

  constructor() {
    this.dbPromise = openDB<ForensicVectorDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-date', 'input.timestamp');
        }
      },
    });
  }

  async saveResult(result: ProcessedResult): Promise<void> {
    // 1. Save to Local IndexedDB (Fast / Offline)
    const db = await this.dbPromise;
    await db.put(STORE_NAME, result);
    console.log(`[Local Storage] Saved ${result.id}`);

    // 2. Sync to Supabase (Cloud Persistence)
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
          duration_ms: result.durationMs,
          created_at: new Date(result.input.timestamp).toISOString()
        });

      if (error) throw error;
      console.log(`[Supabase Remote] Synced ${result.id}`);
    } catch (e) {
      console.error('[Supabase Sync Error]', e);
    }
  }

  async getAllResults(): Promise<ProcessedResult[]> {
    // Try to get from Supabase first to have the latest
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const results = data.map(item => ({
          id: item.id,
          status: item.status,
          input: item.input,
          output: item.output,
          logs: item.logs,
          sources: item.sources,
          durationMs: item.duration_ms
        } as ProcessedResult));

        // Sync local DB with remote data
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const r of results) {
          await tx.store.put(r);
        }
        await tx.done;

        return results;
      }
    } catch (e) {
      console.warn('[Supabase Fetch Error] Falling back to local IDB', e);
    }

    const db = await this.dbPromise;
    return await db.getAllFromIndex(STORE_NAME, 'by-date');
  }

  async getResult(id: string): Promise<ProcessedResult | undefined> {
    const db = await this.dbPromise;
    return await db.get(STORE_NAME, id);
  }

  async deleteResult(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);

    try {
      const { error } = await supabase
        .from('analysis_results')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('[Supabase Delete Error]', e);
    }
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);

    try {
      // Dangerous but requested as clear all
      const { error } = await supabase
        .from('analysis_results')
        .delete()
        .neq('id', 'void'); // Delete everything
      if (error) throw error;
    } catch (e) {
      console.error('[Supabase Clear Error]', e);
    }
  }
}

export const storageService = new StorageService();
