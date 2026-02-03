/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProcessedResult } from '../types';

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
    const db = await this.dbPromise;
    await db.put(STORE_NAME, result);
    console.log(`[Storage] Saved Analysis ${result.id} to Vector Store.`);
  }

  async getAllResults(): Promise<ProcessedResult[]> {
    const db = await this.dbPromise;
    // Get all and sort by timestamp (handled in memory for simplicity or via index)
    const results = await db.getAllFromIndex(STORE_NAME, 'by-date');
    return results; // Returns sorted by date ascending usually
  }

  async getResult(id: string): Promise<ProcessedResult | undefined> {
    const db = await this.dbPromise;
    return await db.get(STORE_NAME, id);
  }

  async deleteResult(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }
}

export const storageService = new StorageService();
