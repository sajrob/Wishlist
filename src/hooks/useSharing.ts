import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const useSharing = () => {
    const { user } = useAuth();

    const shareWithFriends = async (categoryId: string, friendIds: string[]) => {
        if (!user) return { error: new Error('User not authenticated') };

        try {
            const notifications = friendIds.map(friendId => ({
                user_id: friendId,
                actor_id: user.id,
                type: 'wishlist_share',
                message: `shared a wishlist category with you.`,
                category_id: categoryId,
                is_read: false
            }));

            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (notifError) throw notifError;

            // Also record in shared_links
            const sharedLinks = friendIds.map(friendId => ({
                category_id: categoryId,
                shared_by: user.id,
                target_user_id: friendId
            }));

            const { error: linkError } = await supabase
                .from('shared_links')
                .insert(sharedLinks);

            if (linkError) throw linkError;

            toast.success(`Shared with ${friendIds.length} friend(s)!`);
            return { data: true, error: null };
        } catch (err: any) {
            console.error('Full sharing error details:', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code
            });
            toast.error(`Failed to share: ${err.message || 'Unknown error'}`);
            return { error: err };
        }
    };

    const getShareUrl = (categoryId: string) => {
        const baseUrl = window.location.origin;
        // Use the short link /s/ for better social previews
        return `${baseUrl}/s/${categoryId}`;
    };

    return {
        shareWithFriends,
        getShareUrl
    };
};
