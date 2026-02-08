export interface SyncConflict {
    actionId: number;
    localData: any;
    serverData: any;
    resolved: boolean;
}

export function resolveConflict(conflict: SyncConflict, strategy: 'SERVER' | 'LOCAL') {
    if (strategy === 'SERVER') {
        return conflict.serverData;
    }
    return conflict.localData;
}
