-- Add username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE;

-- Create an index for faster lookups
CREATE INDEX profiles_username_idx ON public.profiles (username);

-- specific to your project, you might need to update the handle_new_user trigger
-- to include username from metadata.
-- Example:
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, full_name, avatar_url, username)
--   VALUES (
--     new.id,
--     new.raw_user_meta_data->>'full_name',
--     new.raw_user_meta_data->>'avatar_url',
--     new.raw_user_meta_data->>'username'
--   );
--   RETURN new;
-- END;
-- $$;
