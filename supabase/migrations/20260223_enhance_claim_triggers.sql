-- Phase 1.2: Enhance claim notification trigger with item_id for context-aware routing
-- and add duplicate prevention

-- Add item_id column to notifications table for routing to specific items
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES public.items(id) ON DELETE CASCADE;

-- Add index for faster queries by item_id
CREATE INDEX IF NOT EXISTS notifications_item_id_idx ON public.notifications(item_id);

-- Add check constraint to prevent duplicate notifications within 1 minute for same actor/item
-- This helps prevent duplicate notifications for the same event
ALTER TABLE public.notifications
ADD CONSTRAINT prevent_duplicate_claims 
CHECK (true); -- Placeholder - will use trigger-based approach instead

-- Enhanced function to handle new claims with duplicate prevention
CREATE OR REPLACE FUNCTION public.handle_new_claim_entry()
RETURNS TRIGGER AS $$
DECLARE
    target_owner_id UUID;
    target_item_name TEXT;
    recent_dup_count INT;
BEGIN
    -- Get item owner and name
    SELECT user_id, name INTO target_owner_id, target_item_name 
    FROM public.items 
    WHERE id = NEW.item_id;

    -- Check for duplicate notification (same user, same item, within last 60 seconds)
    SELECT COUNT(*) INTO recent_dup_count
    FROM public.notifications
    WHERE user_id = target_owner_id
        AND actor_id = NEW.user_id
        AND type = 'claim'
        AND item_id = NEW.item_id
        AND created_at > NOW() - INTERVAL '60 seconds';

    -- Skip if duplicate found
    IF recent_dup_count > 0 THEN
        RETURN NEW;
    END IF;

    -- Insert notification with item_id for context-aware routing
    INSERT INTO public.notifications (user_id, actor_id, type, message, item_id)
    VALUES (
        target_owner_id, 
        NEW.user_id, 
        'claim', 
        'claimed "' || target_item_name || '" from your wishlist!',
        NEW.item_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to handle new follows (add actor profile ID for routing)
CREATE OR REPLACE FUNCTION public.handle_new_friend_entry()
RETURNS TRIGGER AS $$
DECLARE
    recent_dup_count INT;
BEGIN
    -- Check for duplicate notification (same users, within last 60 seconds)
    SELECT COUNT(*) INTO recent_dup_count
    FROM public.notifications
    WHERE user_id = NEW.friend_id
        AND actor_id = NEW.user_id
        AND type = 'follow'
        AND created_at > NOW() - INTERVAL '60 seconds';

    -- Skip if duplicate found
    IF recent_dup_count > 0 THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, actor_id, type, message)
    VALUES (
        NEW.friend_id, 
        NEW.user_id, 
        'follow', 
        'started following you!'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced push notification handler to include context-aware URLs
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS TRIGGER AS $$
DECLARE
    actor_name TEXT;
    push_title TEXT;
    notification_url TEXT;
BEGIN
    -- Get actor name for the push title/body
    SELECT COALESCE(full_name, 'Someone') INTO actor_name 
    FROM public.profiles 
    WHERE id = NEW.actor_id;

    -- Determine push title and URL based on type
    IF NEW.type = 'claim' THEN
        push_title := 'Item Claimed! 🎁';
        notification_url := '/items/' || COALESCE(NEW.item_id::TEXT, '');
    ELSIF NEW.type = 'follow' THEN
        push_title := 'New Follower! 👋';
        notification_url := '/profile/' || NEW.actor_id::TEXT;
    ELSIF NEW.type = 'wishlist_share' THEN
        push_title := 'Wishlist Shared! ✨';
        notification_url := '/shared-wishlists';
    ELSE
        push_title := 'New Notification';
        notification_url := '/';
    END IF;

    -- Call Edge Function with context data
    PERFORM net.http_post(
        url := 'https://kcqbdjhoekditfgrktvo.supabase.co/functions/v1/send-push-notification',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
            'user_id', NEW.user_id,
            'type', NEW.type,
            'title', push_title,
            'body', actor_name || ' ' || NEW.message,
            'url', notification_url,
            'data', jsonb_build_object(
                'notification_id', NEW.id::TEXT,
                'type', NEW.type,
                'actor_id', NEW.actor_id::TEXT,
                'item_id', COALESCE(NEW.item_id::TEXT, '')
            )
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure triggers are using the new enhanced functions
DROP TRIGGER IF EXISTS on_claim_created ON public.claims;
CREATE TRIGGER on_claim_created
    AFTER INSERT ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_claim_entry();

DROP TRIGGER IF EXISTS on_friend_created ON public.friends;
CREATE TRIGGER on_friend_created
    AFTER INSERT ON public.friends
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_friend_entry();

DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.send_push_on_notification();
