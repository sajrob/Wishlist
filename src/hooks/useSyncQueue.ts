import { useState, useEffect } from 'react';
import { syncQueue, OfflineAction } from '@/lib/syncQueue';

export function useSyncQueue() {
    const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshQueue = async () => {
        const actions = await syncQueue.getAll();
        setPendingActions(actions);
        setLoading(false);
    };

    useEffect(() => {
        refreshQueue();

        const handleUpdate = () => {
            console.log('[useSyncQueue] Refreshing queue due to Event');
            refreshQueue();
        };
        window.addEventListener('sync-queue-changed', handleUpdate);

        // Polling fallback every 5 seconds
        const pollInterval = setInterval(() => {
            refreshQueue();
        }, 5000);

        // Also listen for message events that might trigger sync
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PROCESS_SYNC_QUEUE') {
                console.log('[useSyncQueue] Refreshing queue due to Message');
                // Short delay to allow processing to finish
                setTimeout(refreshQueue, 500);
            }
        };
        window.addEventListener('message', handleMessage);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleMessage);
        }

        return () => {
            window.removeEventListener('sync-queue-changed', handleUpdate);
            window.removeEventListener('message', handleMessage);
            clearInterval(pollInterval);
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleMessage);
            }
        };
    }, []);

    return {
        pendingActions,
        loading,
        refreshQueue,
        isPending: (type: OfflineAction['type'], itemId: string) => {
            return pendingActions.some(action =>
                action.type === type && action.payload?.id === itemId
            );
        },
        hasPendingClaims: (itemId: string) => {
            return pendingActions.some(action =>
                (action.type === 'CLAIM_ITEM' || action.type === 'UNCLAIM_ITEM') &&
                action.payload?.itemId === itemId
            );
        }
    };
}
