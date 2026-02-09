-- Create table for in-app notifications if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable pg_net extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Universal function to send Push Notification when a row is added to public.notifications
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS TRIGGER AS $$
DECLARE
    actor_name TEXT;
    push_title TEXT;
BEGIN
    -- Get actor name for the push title/body
    SELECT COALESCE(full_name, 'Someone') INTO actor_name 
    FROM public.profiles 
    WHERE id = NEW.actor_id;

    -- Determine push title based on type
    push_title := CASE 
        WHEN NEW.type = 'claim' THEN 'Item Claimed! 🎁'
        WHEN NEW.type = 'follow' THEN 'New Follower! 👋'
        WHEN NEW.type = 'wishlist_share' THEN 'Wishlist Shared! ✨'
        ELSE 'New Notification'
    END;

    -- Call Edge Function
    PERFORM net.http_post(
        url := 'https://kcqbdjhoekditfgrktvo.supabase.co/functions/v1/send-push-notification',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
            'user_id', NEW.user_id,
            'title', push_title,
            'body', actor_name || ' ' || NEW.message,
            'url', '/' -- Default redirect
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for ANY new notification (covers frontend-inserted and DB-inserted ones)
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.send_push_on_notification();

-- Function to handle new claims (Database Level)
CREATE OR REPLACE FUNCTION public.handle_new_claim_entry()
RETURNS TRIGGER AS $$
DECLARE
    target_owner_id UUID;
    target_item_name TEXT;
BEGIN
    SELECT user_id, name INTO target_owner_id, target_item_name 
    FROM public.items 
    WHERE id = NEW.item_id;

    -- Just insert into notifications table; the push trigger above will handle the mobile alert
    INSERT INTO public.notifications (user_id, actor_id, type, message)
    VALUES (
        target_owner_id, 
        NEW.user_id, 
        'claim', 
        'claimed "' || target_item_name || '" from your wishlist!'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new follows (Database Level)
CREATE OR REPLACE FUNCTION public.handle_new_friend_entry()
RETURNS TRIGGER AS $$
BEGIN
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

-- Triggers to generate notifications
DROP TRIGGER IF EXISTS on_claim_created ON public.claims;
CREATE TRIGGER on_claim_created
    AFTER INSERT ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_claim_entry();

DROP TRIGGER IF EXISTS on_friend_created ON public.friends;
CREATE TRIGGER on_friend_created
    AFTER INSERT ON public.friends
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_friend_entry();

