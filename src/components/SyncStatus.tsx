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

    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const prevSyncing = React.useRef(false);

    const [hasAutoSynced, setHasAutoSynced] = useState(false);

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

    // Auto-sync on mount or when coming online if there are pending actions
    useEffect(() => {
        if (!isOffline && pendingCount > 0 && !isSyncing && !hasAutoSynced) {
            setIsSyncing(true);
            setHasAutoSynced(true); // Mark as attempted

            processSyncQueue((action, serverData) =>
                showConflict({
                    actionId: action.id!,
                    localData: action.payload,
                    serverData,
                    resolved: false
                })
            ).then(() => {
                refreshQueue();
            }).finally(() => {
                setIsSyncing(false);
                // Allow re-sync attempt after a delay if still pending (e.g., if new items added)
                setTimeout(() => setHasAutoSynced(false), 10000);
            });
        }
    }, [isOffline, pendingCount, isSyncing, hasAutoSynced]);

    // Show "Saved" message temporarily when sync completes
    useEffect(() => {
        if (prevSyncing.current && !isSyncing && pendingCount === 0) {
            setShowSavedMessage(true);
            const timer = setTimeout(() => setShowSavedMessage(false), 3000);
            return () => clearTimeout(timer);
        }
        prevSyncing.current = isSyncing;
    }, [isSyncing, pendingCount]);

    // Only show when:
    // 1. Offline (primary purpose)
    // 2. Syncing (user needs to know)
    // 3. Just finished syncing (show success message)
    // 4. Pending items exist but auto-sync hasn't triggered yet (prevents flicker)
    const shouldShow = isOffline || isSyncing || showSavedMessage || (pendingCount > 0 && !hasAutoSynced);

    if (!shouldShow) {
        return null;
    }

    let mainText = '';
    let subText = '';
    let icon = null;

    if (isSyncing) {
        mainText = 'Syncing...';
        subText = 'Updating items...';
        icon = <Loader2 className="size-5 animate-spin" />;
    } else if (isOffline) {
        mainText = pendingCount > 0 ? `${pendingCount} Pending` : 'Offline Mode';
        subText = 'Sync will resume when online';
        icon = (
            <div className="relative">
                <RefreshCcw className="size-5 animate-pulse" />
                {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                )}
            </div>
        );
    } else if (pendingCount > 0) {
        mainText = `${pendingCount} Unsynced`;
        subText = 'Click to sync now';
        icon = <RefreshCcw className="size-5 text-amber-500" />;
    } else {
        // Fallback for success state
        mainText = 'List Synced';
        subText = 'All changes saved';
        icon = <CheckCircle2 className="size-5 text-green-500" />;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-500",
                isSyncing
                    ? "bg-primary text-primary-foreground border-primary scale-105"
                    : isOffline
                        ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        : pendingCount > 0
                            ? "bg-amber-100/80 text-amber-700 border-amber-200 hover:border-amber-300 cursor-pointer"
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
                    {icon}
                </div>

                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold tracking-tight leading-none">
                        {mainText}
                    </span>
                    <p className="text-[11px] font-medium opacity-60 leading-none">
                        {subText}
                    </p>
                </div>
            </div>
        </div>
    );
}
