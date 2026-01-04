import React from 'react';
import { toast } from "sonner";

interface DeleteToastOptions {
    title: string;
    description: string;
    onDelete: () => Promise<void> | void;
    deleteLabel?: string;
    cancelLabel?: string;
}

/**
 * Standardized delete confirmation toast with danger styling.
 */
export const confirmDelete = (options: DeleteToastOptions) => {
    const { title, description, onDelete, deleteLabel = "Delete", cancelLabel = "Cancel" } = options;

    return toast(title, {
        description: <span style={{ color: '#607D8B' }}>{description}</span>,
        action: {
            label: deleteLabel,
            onClick: onDelete,
        },
        actionButtonStyle: {
            backgroundColor: '#ef4444',
            color: 'white'
        },
        cancel: {
            label: cancelLabel,
            onClick: () => { },
        }
    });
};
