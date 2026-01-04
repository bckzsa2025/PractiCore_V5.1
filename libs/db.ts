
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 🗄️ PRACTIZONE LOCAL DATABASE ENGINE
 * Technology: IndexedDB (Native Browser Database)
 * Purpose: Persistent storage for Patients, Appointments, and Large Files (Images/PDFs).
 */

const DB_NAME = 'PRACTIZONE_DB_LIVE';
const DB_VERSION = 5; // Bumped to ensure 'content' store is created

export interface DBMetadata {
    createdAt: number;
    updatedAt: number;
}

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
                
                // 1. Users (Patients, Admins)
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }

                // 2. Appointments
                if (!db.objectStoreNames.contains('appointments')) {
                    const store = db.createObjectStore('appointments', { keyPath: 'id' });
                    store.createIndex('patientId', 'patientId', { unique: false });
                    store.createIndex('date', 'date', { unique: false });
                }

                // 3. Documents (Patient Uploads - Large Files)
                if (!db.objectStoreNames.contains('documents')) {
                    const store = db.createObjectStore('documents', { keyPath: 'id' });
                    store.createIndex('patientId', 'patientId', { unique: false });
                }

                // 4. Content (CMS Images for Branding)
                if (!db.objectStoreNames.contains('content')) {
                    db.createObjectStore('content', { keyPath: 'key' });
                }

                // 5. Suppliers
                if (!db.objectStoreNames.contains('suppliers')) {
                    db.createObjectStore('suppliers', { keyPath: 'id' });
                }

                // 6. Logs & Vector Embeddings
                if (!db.objectStoreNames.contains('logs')) {
                    db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('vectors')) {
                    db.createObjectStore('vectors', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error("Database connection failed", (event.target as IDBOpenDBRequest).error);
                reject((event.target as IDBOpenDBRequest).error);
            };
        });

        return this.initPromise;
    }

    // --- GENERIC CRUD OPERATIONS ---

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

    // --- SPECIALIZED QUERY OPERATIONS ---

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

    // --- SYSTEM OPERATIONS ---

    async exportDump(): Promise<Record<string, any[]>> {
        const db = await this.connect();
        const dump: Record<string, any[]> = {};
        const stores = Array.from(db.objectStoreNames);
        
        for (const store of stores) {
            dump[store] = await this.getAll(store);
        }
        return dump;
    }

    async importDump(data: Record<string, any[]>) {
        const db = await this.connect();
        const stores = Object.keys(data);
        
        for (const storeName of stores) {
            if (db.objectStoreNames.contains(storeName)) {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                store.clear(); // Wipe existing
                data[storeName].forEach(item => store.add(item));
            }
        }
    }
}

export const db = new LocalDatabase();
