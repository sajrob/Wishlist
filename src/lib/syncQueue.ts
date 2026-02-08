import { openDB } from 'idb';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

const DB_NAME = 'me-list-db';
const DB_VERSION = 1;

export interface OfflineAction {
    id?: number;
    type: 'CREATE_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'CLAIM_ITEM' | 'UNCLAIM_ITEM' | 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'DELETE_CATEGORY';
    table: string;
    payload: any;
    timestamp: number;
}

export const syncQueue = {
    async add(action: Omit<OfflineAction, 'timestamp'>) {
        const db = await openDB(DB_NAME, DB_VERSION);
        const newAction = { ...action, timestamp: Date.now() };
        await db.add('sync-queue', newAction);

        // Notify components to update instantly
        window.dispatchEvent(new CustomEvent('sync-queue-changed'));

        // Try to register background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            try {
                await (registration as any).sync.register('sync-pending-actions');
            } catch (err) {
                console.warn('Background sync registration failed:', err);
            }
        }
    },

    async getAll(): Promise<OfflineAction[]> {
        const db = await openDB(DB_NAME, DB_VERSION);
        return db.getAll('sync-queue');
    },

    async remove(id: number) {
        const db = await openDB(DB_NAME, DB_VERSION);
        await db.delete('sync-queue', id);
    },

    async clear() {
        const db = await openDB(DB_NAME, DB_VERSION);
        await db.clear('sync-queue');
    }
};

export async function processSyncQueue() {
    const actions = await syncQueue.getAll();
    if (actions.length === 0) return;

    console.log(`Processing ${actions.length} pending actions...`);

    for (const action of actions) {
        try {
            let result;

            switch (action.type) {
                case 'CREATE_ITEM':
                    result = await supabase.from('items').insert(action.payload);
                    break;
                case 'UPDATE_ITEM':
                    result = await supabase.from('items').update(action.payload).eq('id', action.payload.id);
                    break;
                case 'DELETE_ITEM':
                    result = await supabase.from('items').delete().eq('id', action.payload.id);
                    break;
                // Add other cases as needed
            }

            if (result?.error) throw result.error;

            if (action.id) await syncQueue.remove(action.id);
        } catch (err) {
            console.error(`Failed to sync action ${action.id}:`, err);
            // Keep in queue for next retry
        }
    }
}
