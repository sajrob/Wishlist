-- Create table for push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id);

-- Explicitly allow service role for edge functions
CREATE POLICY "Service role can manage all subscriptions"
ON public.push_subscriptions
FOR ALL
TO service_role
USING (true);

-- Ensure profiles is enabled for admins to manage (optional but good for future)
-- CREATE POLICY "Admins can view all subscriptions"
-- ON public.push_subscriptions
-- FOR SELECT
-- TO authenticated
-- USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
