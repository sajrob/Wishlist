import React from 'react';
import { WifiOff, Info } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export function OfflineBanner() {
    const isOffline = useOfflineStatus();

    if (!isOffline) return null;

    return (
        <div className="bg-destructive text-destructive-foreground py-2 px-4 shadow-md sticky top-0 z-[100] animate-in slide-in-from-top duration-300">
            <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
                <WifiOff className="size-4" />
                <span>You are currently offline. Viewing cached data.</span>
                <button
                    onClick={() => window.location.reload()}
                    className="ml-4 underline underline-offset-4 hover:opacity-80 transition-opacity flex items-center gap-1"
                >
                    <Info className="size-3" />
                    Retry
                </button>
            </div>
        </div>
    );
}
