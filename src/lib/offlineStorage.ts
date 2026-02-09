import { openDB, IDBPDatabase } from 'idb';
import { WishlistItem, Category, Profile } from '../types';

const DB_NAME = 'me-list-db';
const DB_VERSION = 2;

export interface MeListDB extends IDBPDatabase {
    // Define custom methods if needed
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = () => {
    if (dbPromise) return dbPromise;

    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
            console.log(`Upgrading IndexedDB from ${oldVersion} to ${newVersion}`);
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('profiles')) {
                db.createObjectStore('profiles', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('sync-queue')) {
                db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
            }
        },
    });

    return dbPromise;
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
