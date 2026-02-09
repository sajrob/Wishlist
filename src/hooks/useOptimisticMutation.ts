import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { syncQueue, OfflineAction } from '@/lib/syncQueue';
import { toast } from 'sonner';

interface OptimisticOptions<TData, TError, TVariables, TContext>
    extends UseMutationOptions<TData, TError, TVariables, TContext> {
    actionType: OfflineAction['type'] | ((variables: TVariables) => OfflineAction['type']);
    table: string | ((variables: TVariables) => string);
}

export function useOptimisticMutation<TData, TError, TVariables, TContext>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: OptimisticOptions<TData, TError, TVariables, TContext>
) {
    const queryClient = useQueryClient();

    const {
        onSuccess: userOnSuccess,
        onError: userOnError,
        onSettled: userOnSettled,
        onMutate: userOnMutate,
        actionType: _actionType,
        table: _table,
        ...mutationOptions
    } = options;

    return useMutation<TData, TError, TVariables, TContext>({
        ...mutationOptions as any,
        networkMode: 'always',
        mutationFn: async (variables: TVariables) => {
            const isOffline = !navigator.onLine;
            console.log(`[OptimisticMutation] Executing. Offline: ${isOffline}`);

            if (isOffline) {
                const actionType = typeof options.actionType === 'function' ? (options.actionType as any)(variables) : options.actionType;
                const table = typeof options.table === 'function' ? (options.table as any)(variables) : options.table;

                console.log(`[OptimisticMutation] Queuing ${actionType} while offline`);
                await syncQueue.add({
                    type: actionType,
                    table: table,
                    payload: variables,
                });

                toast.info('Action queued for sync (Offline)');
                return { data: null, offline: true } as unknown as TData;
            }

            try {
                const result = await mutationFn(variables);
                if (result && (result as any).error) {
                    console.warn('[OptimisticMutation] API returned error:', (result as any).error);
                    throw (result as any).error;
                }
                return result;
            } catch (error: any) {
                const msg = (error?.message || '').toLowerCase();
                const name = (error?.name || '');
                const isNetworkError =
                    !navigator.onLine ||
                    name === 'TypeError' ||
                    name === 'NetworkError' ||
                    msg.includes('fetch') ||
                    msg.includes('network') ||
                    msg.includes('load failed') ||
                    msg.includes('dns');

                console.warn(`[OptimisticMutation] Mutation failed. Name: ${name}, IsNetwork: ${isNetworkError}`, error);

                if (isNetworkError) {
                    const actionType = typeof options.actionType === 'function' ? (options.actionType as any)(variables) : options.actionType;
                    const table = typeof options.table === 'function' ? (options.table as any)(variables) : options.table;

                    await syncQueue.add({ type: actionType, table: table, payload: variables });
                    toast.info('Action queued (Connection issue)');
                    return { data: null, offline: true } as unknown as TData;
                }
                throw error;
            }
        },
        onMutate: async (variables) => {
            console.log('[OptimisticMutation] onMutate');
            await queryClient.cancelQueries();
            if (userOnMutate) {
                return (userOnMutate as any)(variables);
            }
            return undefined as any;
        },
        onSuccess: (data, variables, context) => {
            console.log('[OptimisticMutation] onSuccess');
            if (userOnSuccess) {
                (userOnSuccess as any)(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            console.error('[OptimisticMutation] onError:', error);
            if (userOnError) {
                (userOnError as any)(error, variables, context);
            }
        },
        onSettled: (data, error, variables, context) => {
            console.log('[OptimisticMutation] onSettled. Error:', !!error);
            if (navigator.onLine && !error) {
                queryClient.invalidateQueries();
            }
            if (userOnSettled) {
                (userOnSettled as any)(data, error, variables, context);
            }
        }
    });
}
