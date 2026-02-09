import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SyncConflict, resolveConflict } from '@/lib/conflictResolution';
import { ConflictDialog } from '@/components/ConflictDialog';

interface ConflictContextType {
    showConflict: (conflict: SyncConflict) => Promise<'SERVER' | 'LOCAL'>;
}

const ConflictContext = createContext<ConflictContextType | undefined>(undefined);

export function ConflictProvider({ children }: { children: ReactNode }) {
    const [activeConflict, setActiveConflict] = useState<SyncConflict | null>(null);
    const [resolvePromise, setResolvePromise] = useState<{ resolve: (val: 'SERVER' | 'LOCAL') => void } | null>(null);

    const showConflict = (conflict: SyncConflict): Promise<'SERVER' | 'LOCAL'> => {
        return new Promise((resolve) => {
            setActiveConflict(conflict);
            setResolvePromise({ resolve });
        });
    };

    const handleResolve = (strategy: 'SERVER' | 'LOCAL') => {
        if (resolvePromise) {
            resolvePromise.resolve(strategy);
            setResolvePromise(null);
            setActiveConflict(null);
        }
    };

    return (
        <ConflictContext.Provider value={{ showConflict }}>
            {children}
            <ConflictDialog
                conflict={activeConflict}
                onResolve={handleResolve}
                onClose={() => handleResolve('SERVER')} // Default to server on close
            />
        </ConflictContext.Provider>
    );
}

export function useConflict() {
    const context = useContext(ConflictContext);
    if (!context) {
        throw new Error('useConflict must be used within a ConflictProvider');
    }
    return context;
}
