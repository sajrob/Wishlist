import { openDB } from 'idb';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

import { initDB } from './offlineStorage';

export interface OfflineAction {
    id?: number;
    type:
    | 'CREATE_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM'
    | 'CLAIM_ITEM' | 'UNCLAIM_ITEM'
    | 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'DELETE_CATEGORY'
    | 'FOLLOW_USER' | 'UNFOLLOW_USER';
    table: string;
    payload: any;
    timestamp: number;
}

const getDB = initDB;

export const syncQueue = {
    async add(action: Omit<OfflineAction, 'timestamp'>) {
        try {
            const db = await getDB();
            const newAction = { ...action, timestamp: Date.now() };
            await db.add('sync-queue', newAction);
            console.log(`[SyncQueue] Action added: ${action.type}`, newAction);

            // Notify components to update instantly
            window.dispatchEvent(new CustomEvent('sync-queue-changed'));

            // Try to register background sync if available (non-blocking)
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    return (registration as any).sync.register('sync-pending-actions');
                }).catch(err => {
                    console.warn('Background sync registration failed:', err);
                });
            }
        } catch (error) {
            console.error('Failed to add action to sync queue:', error);
            toast.error('Failed to save action offline');
        }
    },

    async getAll(): Promise<OfflineAction[]> {
        try {
            const db = await getDB();
            return await db.getAll('sync-queue');
        } catch (error) {
            console.error('Failed to get sync queue:', error);
            return [];
        }
    },

    async remove(id: number) {
        try {
            const db = await getDB();
            await db.delete('sync-queue', id);
        } catch (error) {
            console.error('Failed to remove action from sync queue:', error);
        }
    },

    async clear() {
        try {
            const db = await getDB();
            await db.clear('sync-queue');
        } catch (error) {
            console.error('Failed to clear sync queue:', error);
        }
    }
};

export async function processSyncQueue(onConflict?: (action: OfflineAction, serverData: any) => Promise<'SERVER' | 'LOCAL'>) {
    const actions = await syncQueue.getAll();
    if (actions.length === 0) return;

    console.log(`[SyncQueue] Processing ${actions.length} pending actions...`);

    for (const action of actions) {
        try {
            let result;

            switch (action.type) {
                case 'CREATE_ITEM':
                    result = await supabase.from('items').insert(action.payload);
                    break;
                case 'UPDATE_ITEM':
                    // Basic Conflict Detection
                    if (onConflict) {
                        const { data: serverItem } = await supabase.from('items').select('*').eq('id', action.payload.itemId).single();
                        if (serverItem && serverItem.updated_at > action.timestamp) {
                            console.warn(`[SyncQueue] Conflict detected for action ${action.type} on item ${action.payload.itemId}. Server is newer.`);
                            const choice = await onConflict(action, serverItem);
                            if (choice === 'SERVER') {
                                // Skip local update, server is fresher
                                if (action.id) await syncQueue.remove(action.id);
                                continue;
                            }
                        }
                    }
                    result = await supabase.from('items').update(action.payload.updates).eq('id', action.payload.itemId);
                    break;
                case 'DELETE_ITEM':
                    result = await supabase.from('items').delete().eq('id', action.payload);
                    break;
                case 'CLAIM_ITEM':
                    result = await supabase.from('claims').insert({
                        item_id: action.payload.itemId,
                        user_id: action.payload.claimUserId
                    });
                    break;
                case 'UNCLAIM_ITEM':
                    result = await supabase.from('claims').delete()
                        .eq('item_id', action.payload.itemId)
                        .eq('user_id', action.payload.claimUserId);
                    break;
                case 'CREATE_CATEGORY':
                    result = await supabase.from('categories').insert(action.payload);
                    break;
                case 'UPDATE_CATEGORY':
                    result = await supabase.from('categories').update(action.payload.categoryData).eq('id', action.payload.categoryId);
                    break;
                case 'DELETE_CATEGORY':
                    result = await supabase.from('categories').delete().eq('id', action.payload);
                    break;
                case 'FOLLOW_USER':
                    // We need the logged-in user ID passed in payload or handle differently
                    // For now assume payload has what followUser expects
                    result = await supabase.from('friends').insert({
                        user_id: action.payload.userId,
                        friend_id: action.payload.friendId
                    });
                    break;
                case 'UNFOLLOW_USER':
                    result = await supabase.from('friends').delete()
                        .eq('user_id', action.payload.userId)
                        .eq('friend_id', action.payload.friendId);
                    break;
            }

            if (result?.error) throw result.error;

            if (action.id) await syncQueue.remove(action.id);
        } catch (err) {
            console.error(`Failed to sync action ${action.id}:`, err);
            // Keep in queue for next retry
        }
    }
}
