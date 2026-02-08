import { openDB, IDBPDatabase } from 'idb';
import { WishlistItem, Category, Profile } from '../types';

const DB_NAME = 'me-list-db';
const DB_VERSION = 1;

export interface MeListDB extends IDBPDatabase {
    // Define custom methods if needed
}

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('profiles')) {
                db.createObjectStore('profiles', { keyPath: 'id' });
            }
            // Store for pending actions when offline
            if (!db.objectStoreNames.contains('sync-queue')) {
                db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const offlineStorage = {
    async saveItems(items: WishlistItem[]) {
        const db = await initDB();
        const tx = db.transaction('items', 'readwrite');
        await Promise.all(items.map(item => tx.store.put(item)));
        await tx.done;
    },

    async getItems(): Promise<WishlistItem[]> {
        const db = await initDB();
        return db.getAll('items');
    },

    async saveCategories(categories: Category[]) {
        const db = await initDB();
        const tx = db.transaction('categories', 'readwrite');
        await Promise.all(categories.map(cat => tx.store.put(cat)));
        await tx.done;
    },

    async getCategories(): Promise<Category[]> {
        const db = await initDB();
        return db.getAll('categories');
    },

    async saveProfile(profile: Profile) {
        const db = await initDB();
        await db.put('profiles', profile);
    },

    async getProfile(id: string): Promise<Profile | undefined> {
        const db = await initDB();
        return db.get('profiles', id);
    },

    async clearAll() {
        const db = await initDB();
        const tx = db.transaction(['items', 'categories', 'profiles'], 'readwrite');
        await tx.objectStore('items').clear();
        await tx.objectStore('categories').clear();
        await tx.objectStore('profiles').clear();
        await tx.done;
    }
};
