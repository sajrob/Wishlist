import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, Loader2, WifiOff } from 'lucide-react';
import { syncQueue, processSyncQueue } from '@/lib/syncQueue';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { useConflict } from '@/context/ConflictContext';
import { cn } from '@/lib/utils';

export function SyncStatus() {
    const isOffline = useOfflineStatus();
    const { pendingActions, refreshQueue } = useSyncQueue();
    const { showConflict } = useConflict();
    const [isSyncing, setIsSyncing] = useState(false);
    const pendingCount = pendingActions.length;

    useEffect(() => {
        const handleSyncMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PROCESS_SYNC_QUEUE') {
                setIsSyncing(true);
                processSyncQueue((action, serverData) =>
                    showConflict({
                        actionId: action.id!,
                        localData: action.payload,
                        serverData,
                        resolved: false
                    })
                ).then(() => {
                    setIsSyncing(false);
                    refreshQueue();
                });
            }
        };

        window.addEventListener('message', handleSyncMessage);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSyncMessage);
        }

        return () => {
            window.removeEventListener('message', handleSyncMessage);
        };
    }, []);

    // Only show when offline, syncing, or have pending actions
    if (!isOffline && pendingCount === 0 && !isSyncing) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-500",
                isSyncing
                    ? "bg-primary text-primary-foreground border-primary scale-105"
                    : isOffline
                        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        : "bg-background/80 text-foreground border-border hover:border-primary/50 cursor-pointer"
            )}
                onClick={async () => {
                    if (!isOffline && pendingCount > 0 && !isSyncing) {
                        setIsSyncing(true);
                        await processSyncQueue((action, serverData) =>
                            showConflict({
                                actionId: action.id!,
                                localData: action.payload,
                                serverData,
                                resolved: false
                            })
                        );
                        await refreshQueue();
                        setIsSyncing(false);
                    }
                }}
                title={pendingCount > 0 ? "Click to sync changes" : ""}
            >
                <div className="relative flex items-center justify-center">
                    {isSyncing ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : isOffline ? (
                        <div className="relative">
                            <RefreshCcw className="size-5 animate-pulse" />
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                            )}
                        </div>
                    ) : (
                        <CheckCircle2 className="size-5 text-green-500" />
                    )}
                </div>

                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold tracking-tight leading-none">
                        {isSyncing ? 'Syncing...' :
                            isOffline ? (pendingCount > 0 ? `${pendingCount} Pending` : 'Offline Mode') :
                                'List Synced'}
                    </span>
                    <p className="text-[11px] font-medium opacity-60 leading-none">
                        {isSyncing ? 'Updating items...' :
                            isOffline ? 'Sync will resume when online' :
                                'All changes saved'}
                    </p>
                </div>
            </div>
        </div>
    );
}
