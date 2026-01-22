import { useQuery } from '@tanstack/react-query';
import { fetchUserStats } from '@/api';

export function useUserStats(userId: string | undefined) {
    return useQuery({
        queryKey: ['user-stats', userId],
        queryFn: async () => {
            if (!userId) return { items: 0, categories: 0, friends: 0 };
            const { data, error } = await fetchUserStats(userId);
            if (error) throw error;
            return data || { items: 0, categories: 0, friends: 0 };
        },
        enabled: !!userId,
    });
}

