/**
 * Custom hook for managing profile updates using React Query
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { queryKeys } from '../lib/queryClient';
import { updateProfile as apiUpdateProfile } from '@/api';

type UpdateProfileData = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    full_name: string;
};

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            // 1. Update Auth Metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    full_name: data.full_name,
                    username: data.username,
                },
            });

            if (authError) throw authError;

            // 2. Update Public Profile Table
            const { data: updatedProfile, error: profileError } = await apiUpdateProfile({
                id: data.id,
                first_name: data.first_name,
                last_name: data.last_name,
                full_name: data.full_name,
                username: data.username,
            });

            if (profileError) {
                if (profileError.message.includes('unique constraint')) {
                    throw new Error("Username is already taken");
                }
                throw profileError;
            }

            return updatedProfile;
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: queryKeys.profile(data.id) });
            }
            toast.success('Your profile has been updated!');
        },
        onError: (error: any) => {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Could not update profile');
        },
    });
}
