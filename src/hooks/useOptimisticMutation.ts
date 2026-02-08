import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { syncQueue, OfflineAction } from '@/lib/syncQueue';
import { toast } from 'sonner';

interface OptimisticOptions<TData, TError, TVariables, TContext>
    extends UseMutationOptions<TData, TError, TVariables, TContext> {
    actionType: OfflineAction['type'];
    table: string;
}

export function useOptimisticMutation<TData, TError, TVariables, TContext>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: OptimisticOptions<TData, TError, TVariables, TContext>
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (variables) => {
            if (!navigator.onLine) {
                // Queue the action
                await syncQueue.add({
                    type: options.actionType,
                    table: options.table,
                    payload: variables,
                });

                toast.info('You are offline. Action queued for sync.');
                // Return a mock result or throw to trigger optimistic update if needed
                return null as unknown as TData;
            }
            return mutationFn(variables);
        },
        onMutate: async (variables) => {
            // Cancel refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries();

            // Perform manual optimistic updates here if needed by user
            if (options.onMutate) {
                return options.onMutate(variables);
            }
        },
        onSettled: (data, error, variables, context) => {
            if (navigator.onLine) {
                queryClient.invalidateQueries();
            }
            if (options.onSettled) {
                options.onSettled(data, error, variables, context);
            }
        }
    });
}
