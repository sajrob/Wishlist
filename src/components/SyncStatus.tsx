import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { syncQueue, OfflineAction } from '@/lib/syncQueue';
import { cn } from '@/lib/utils';

export function SyncStatus() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const checkQueue = async () => {
        const actions = await syncQueue.getAll();
        setPendingCount(actions.length);
    };

    useEffect(() => {
        checkQueue();
        // Poll for changes or listen to a custom event
        const interval = setInterval(checkQueue, 5000);

        const handleSyncMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PROCESS_SYNC_QUEUE') {
                setIsSyncing(true);
                // Triggered by SW
                setTimeout(() => setIsSyncing(false), 2000);
            }
        };

        const handleQueueChange = () => {
            checkQueue();
        };

        window.addEventListener('message', handleSyncMessage);
        window.addEventListener('sync-queue-changed', handleQueueChange);
        return () => {
            clearInterval(interval);
            window.removeEventListener('message', handleSyncMessage);
            window.removeEventListener('sync-queue-changed', handleQueueChange);
        };

    }, []);

    if (pendingCount === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300",
                isSyncing
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/80 text-foreground border-border"
            )}>
                {isSyncing ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <RefreshCcw className="size-4 animate-pulse" />
                )}
                <div className="flex flex-col">
                    <span className="text-xs font-bold leading-none">
                        {isSyncing ? 'Syncing...' : `${pendingCount} Pending Action${pendingCount > 1 ? 's' : ''}`}
                    </span>
                    <span className="text-[10px] opacity-70">
                        Will sync when connection returns
                    </span>
                </div>
            </div>
        </div>
    );
}
