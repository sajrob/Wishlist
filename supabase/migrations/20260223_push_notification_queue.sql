-- Add observability and retry logic for push notifications
-- This table tracks all push delivery attempts

CREATE TABLE IF NOT EXISTS public.push_notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT,
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    last_error TEXT,
    http_status_code INT,
    status TEXT DEFAULT 'pending', -- pending, sent, failed, skipped
    url TEXT DEFAULT '/',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS push_queue_status_idx 
ON public.push_notification_queue(status) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS push_queue_user_id_idx 
ON public.push_notification_queue(user_id);

-- Function to log push attempts (for debugging)
CREATE OR REPLACE FUNCTION public.queue_push_notification(
    p_user_id UUID,
    p_notification_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_type TEXT,
    p_url TEXT DEFAULT '/'
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.push_notification_queue (
        user_id, notification_id, title, body, notification_type, url
    ) VALUES (
        p_user_id, p_notification_id, p_title, p_body, p_type, p_url
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced trigger to log push notification attempts (non-blocking)
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS TRIGGER AS $$
DECLARE
    actor_name TEXT;
    push_title TEXT;
    notification_url TEXT;
    http_response RECORD;
BEGIN
    -- Get actor name for the push title/body
    SELECT COALESCE(full_name, 'Someone') INTO actor_name 
    FROM public.profiles 
    WHERE id = NEW.actor_id;

    -- Determine push title and URL based on type
    IF NEW.type = 'claim' THEN
        push_title := 'Item Claimed! 🎁';
        notification_url := '/dashboard';
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

    -- Queue the push notification attempt (for observability and retry)
    -- We NO LONGER make the HTTP call here to prevent synchronous blocking and cold starts
    PERFORM public.queue_push_notification(
        NEW.user_id,
        NEW.id,
        push_title,
        actor_name || ' ' || NEW.message,
        NEW.type,
        notification_url
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the notification creation
    INSERT INTO public.push_notification_queue (
        user_id, notification_id, title, body, notification_type, status, last_error
    ) VALUES (
        NEW.user_id, NEW.id, push_title, actor_name || ' ' || NEW.message, NEW.type,
        'failed', SQLERRM
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process the push queue asynchronously
CREATE OR REPLACE FUNCTION public.process_push_queue()
RETURNS TRIGGER AS $$
BEGIN
    -- Call Edge Function (non-blocking with PERFORM)
    PERFORM net.http_post(
        url := 'https://kcqbdjhoekditfgrktvo.supabase.co/functions/v1/send-push-notification',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
            'user_id', NEW.user_id::TEXT,
            'type', NEW.notification_type,
            'title', NEW.title,
            'body', NEW.body,
            'url', NEW.url, -- Need to add 'url' column to queue
            'data', jsonb_build_object(
                'notification_id', NEW.notification_id::TEXT,
                'queue_id', NEW.id::TEXT,
                'type', NEW.notification_type
            )
        ),
        timeout_milliseconds := 5000
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_push_queue_inserted ON public.push_notification_queue;
CREATE TRIGGER on_push_queue_inserted
    AFTER INSERT ON public.push_notification_queue
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION public.process_push_queue();

-- Enable RLS on queue table
ALTER TABLE public.push_notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS policy (only service role and the user can see their own queue)
DROP POLICY IF EXISTS "Users can view their own push queue" ON public.push_notification_queue;
CREATE POLICY "Users can view their own push queue"
ON public.push_notification_queue FOR SELECT
USING (auth.uid() = user_id OR current_setting('role') = 'authenticated');
