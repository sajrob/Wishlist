import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import type { Profile } from '@/types';

export function useProfile(userId: string | null) {
    return useQuery({
        queryKey: queryKeys.profile(userId || ''),
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await fetchProfile(userId);
            if (error) throw error;
            return data as Profile;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
}
