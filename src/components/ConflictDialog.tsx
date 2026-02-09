import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SyncConflict, resolveConflict } from '@/lib/conflictResolution';

interface ConflictDialogProps {
    conflict: SyncConflict | null;
    onResolve: (strategy: 'SERVER' | 'LOCAL') => void;
    onClose: () => void;
}

export function ConflictDialog({ conflict, onResolve, onClose }: ConflictDialogProps) {
    if (!conflict) return null;

    return (
        <Dialog open={!!conflict} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Sync Conflict Detected</DialogTitle>
                    <DialogDescription>
                        The data on the server has changed since you were last online.
                        Which version would you like to keep?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Your Version (Local)</h4>
                        <pre className="text-xs bg-muted p-2 rounded max-h-40 overflow-auto">
                            {JSON.stringify(conflict.localData, null, 2)}
                        </pre>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onResolve('LOCAL')}
                        >
                            Keep Mine
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Server Version</h4>
                        <pre className="text-xs bg-muted p-2 rounded max-h-40 overflow-auto">
                            {JSON.stringify(conflict.serverData, null, 2)}
                        </pre>
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => onResolve('SERVER')}
                        >
                            Keep Server's
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Decide Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
