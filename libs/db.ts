
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 🗄️ PRACTIZONE LOCAL DATABASE ENGINE
 */

const DB_NAME = 'PRACTIZONE_DB_LIVE';
const DB_VERSION = 7; // Bumped for chats store

export class LocalDatabase {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<IDBDatabase> | null = null;

    constructor() {
        this.connect();
    }

    private connect(): Promise<IDBDatabase> {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                const stores = [
                    { name: 'users', key: 'id' },
                    { name: 'appointments', key: 'id', indexes: ['patientId', 'date'] },
                    { name: 'documents', key: 'id', indexes: ['patientId'] },
                    { name: 'content', key: 'key' },
                    { name: 'suppliers', key: 'id' },
                    { name: 'logs', key: 'id', auto: true },
                    { name: 'vectors', key: 'id' },
                    { name: 'services', key: 'id' },
                    { name: 'doctors', key: 'id' },
                    { name: 'config', key: 'key' },
                    { name: 'chats', key: 'id' } // New Store for Chat Sessions
                ];

                stores.forEach(s => {
                    if (!db.objectStoreNames.contains(s.name)) {
                        const store = db.createObjectStore(s.name, { keyPath: s.key, autoIncrement: s.auto || false });
                        if (s.indexes) {
                            s.indexes.forEach(idx => store.createIndex(idx, idx, { unique: false }));
                        }
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });

        return this.initPromise;
    }

    async getAll<T>(storeName: string): Promise<T[]> {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async get<T>(storeName: string, id: string): Promise<T | undefined> {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName: string, item: any): Promise<any> {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ ...item, updatedAt: Date.now() });
            request.onsuccess = () => resolve(item);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName: string, id: string): Promise<void> {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
        const db = await this.connect();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async exportDump(): Promise<Record<string, any[]>> {
        const db = await this.connect();
        const dump: Record<string, any[]> = {};
        const stores = Array.from(db.objectStoreNames);
        for (const store of stores) dump[store] = await this.getAll(store);
        return dump;
    }

    async importDump(data: Record<string, any[]>) {
        const db = await this.connect();
        for (const storeName of Object.keys(data)) {
            if (db.objectStoreNames.contains(storeName)) {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                store.clear(); 
                data[storeName].forEach(item => store.add(item));
            }
        }
    }
}

export const db = new LocalDatabase();
