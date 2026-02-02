import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAdminFeedback,
    updateFeedbackStatus,
    deleteFeedback,
    getAdminUsers,
    getAdminWishlists,
    getAdminItems,
    deleteAdminItem,
    toggleAdminStatus,
    getAdminClaims,
    deleteAdminClaim,
    getAdminCategories,
    getAdminActivityLog,
    logAdminAction
} from "@/api/admin";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import { Feedback } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

// ==================== ACTIVITY LOGS ====================

export function useAdminActivityLog() {
    return useQuery({
        queryKey: queryKeys.adminActivityLog(),
        queryFn: getAdminActivityLog,
    });
}

// ==================== FEEDBACK ====================

export function useAdminFeedback() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const query = useQuery({
        queryKey: queryKeys.adminFeedback(),
        queryFn: getAdminFeedback,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, notes }: { id: string, status: Feedback['status'], notes?: string }) =>
            updateFeedbackStatus(id, status, notes),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback() });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminActivityLog() });
            toast.success("Feedback updated successfully");

            if (user) {
                logAdminAction({
                    admin_id: user.id,
                    action_type: 'UPDATE_STATUS',
                    entity_type: 'FEEDBACK',
                    entity_id: variables.id,
                    details: { status: variables.status }
                });
            }
        },
        onError: (error) => {
            console.error("Error updating feedback:", error);
            toast.error("Failed to update feedback");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteFeedback(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback() });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminActivityLog() });
            toast.success("Feedback deleted");

            if (user) {
                logAdminAction({
                    admin_id: user.id,
                    action_type: 'DELETE',
                    entity_type: 'FEEDBACK',
                    entity_id: id
                });
            }
        },
        onError: (error) => {
            console.error("Error deleting feedback:", error);
            toast.error("Failed to delete feedback");
        }
    });

    return {
        ...query,
        updateStatus: updateStatusMutation.mutateAsync,
        deleteFeedback: deleteMutation.mutateAsync,
        isUpdating: updateStatusMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

// ==================== USERS ====================

export function useAdminUsers() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const query = useQuery({
        queryKey: queryKeys.adminUsers(),
        queryFn: getAdminUsers,
    });

    const toggleAdminMutation = useMutation({
        mutationFn: ({ userId, isAdmin }: { userId: string, isAdmin: boolean }) =>
            toggleAdminStatus(userId, isAdmin),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminActivityLog() });
            toast.success("User admin status updated");

            if (user) {
                logAdminAction({
                    admin_id: user.id,
                    action_type: 'TOGGLE_ADMIN',
                    entity_type: 'USER',
                    entity_id: variables.userId,
                    details: { is_admin: variables.isAdmin }
                });
            }
        },
        onError: (error) => {
            console.error("Error toggling admin status:", error);
            toast.error("Failed to update admin status");
        }
    });

    return {
        ...query,
        toggleAdmin: toggleAdminMutation.mutateAsync,
        isToggling: toggleAdminMutation.isPending,
    };
}

// ==================== WISHLISTS ====================

export function useAdminWishlists() {
    return useQuery({
        queryKey: queryKeys.adminWishlists(),
        queryFn: getAdminWishlists,
    });
}

// ==================== ITEMS ====================

export function useAdminItems() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const query = useQuery({
        queryKey: queryKeys.adminItems(),
        queryFn: getAdminItems,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAdminItem(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminItems() });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminActivityLog() });
            toast.success("Item deleted");

            if (user) {
                logAdminAction({
                    admin_id: user.id,
                    action_type: 'DELETE',
                    entity_type: 'ITEM',
                    entity_id: id
                });
            }
        },
        onError: (error) => {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item");
        }
    });

    return {
        ...query,
        deleteItem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}

// ==================== CLAIMS ====================

export function useAdminClaims() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const query = useQuery({
        queryKey: queryKeys.adminClaims(),
        queryFn: getAdminClaims,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAdminClaim(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.adminClaims() });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminActivityLog() });
            toast.success("Claim removed");

            if (user) {
                logAdminAction({
                    admin_id: user.id,
                    action_type: 'DELETE',
                    entity_type: 'CLAIM',
                    entity_id: id
                });
            }
        },
        onError: (error) => {
            console.error("Error deleting claim:", error);
            toast.error("Failed to remove claim");
        }
    });

    return {
        ...query,
        deleteClaim: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}

// ==================== CATEGORIES ====================

export function useAdminCategories() {
    return useQuery({
        queryKey: queryKeys.adminCategories(),
        queryFn: getAdminCategories,
    });
}

