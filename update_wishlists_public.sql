-- 1. Create Wishlists Table
-- This table currently holds the public visibility status of a user's wishlist
create table if not exists public.wishlists (
    id uuid references auth.users not null primary key, -- Using user_id as PK for 1:1 relationship
    is_public boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. RLS for Wishlists
alter table public.wishlists enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Everyone can view wishlist settings" on public.wishlists;
drop policy if exists "Users can update own wishlist settings" on public.wishlists;
drop policy if exists "Users can insert own wishlist settings" on public.wishlists;

-- Policy: Everyone can see if a wishlist is public or not (needed to determine if we can show items)
create policy "Everyone can view wishlist settings"
  on public.wishlists for select
  using ( true );

-- Policy: Users can update their own wishlist settings
create policy "Users can update own wishlist settings"
  on public.wishlists for update
  using ( auth.uid() = id );

-- Policy: Users can insert their own wishlist settings
create policy "Users can insert own wishlist settings"
  on public.wishlists for insert
  with check ( auth.uid() = id );


-- 3. Update User Creation Trigger
-- We update the existing function to also create a wishlist entry
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into profiles
  insert into public.profiles (id, email, first_name, last_name, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name'
  );
  
  -- Insert into wishlists
  insert into public.wishlists (id, is_public)
  values (new.id, false);
  
  return new;
end;
$$ language plpgsql security definer;


-- 4. Backfill existing users
-- If users already exist without a wishlist entry, create one.
insert into public.wishlists (id, is_public)
select id, false from public.profiles
where id not in (select id from public.wishlists);


-- 5. Update Items and Categories RLS policies
-- We need to allow access if:
-- 1. User is friend (existing logic)
-- 2. OR Wishlist is public

-- Items Policy
drop policy if exists "Users can view friends items" on public.items;
drop policy if exists "Public view of items" on public.items; -- Cleanup old if exists

create policy "View items if friend or public"
  on public.items for select
  using (
    exists (
      select 1 from public.friends
      where (user_id = auth.uid() and friend_id = items.user_id)
    )
    OR
    exists (
      select 1 from public.wishlists
      where (id = items.user_id and is_public = true)
    )
    -- Also user can see own items (usually covered by "Users can select their own items" if distinct, 
    -- but let's Ensure owner access is preserved. 
    -- WARNING: If there is a separate "Owner" policy, this is fine. 
    -- If we rely on this policy for everything, we must include owner check.
    -- Usually "Users can select their own items" exists separately. 
    -- Let's check typical setup or include it here to be safe.)
    OR
    (auth.uid() = items.user_id)
  );

-- Categories Policy
drop policy if exists "Users can view friends categories" on public.categories;

create policy "View categories if friend or public"
  on public.categories for select
  using (
    exists (
      select 1 from public.friends
      where (user_id = auth.uid() and friend_id = categories.user_id)
    )
    OR
    exists (
      select 1 from public.wishlists
      where (id = categories.user_id and is_public = true)
    )
    OR
    (auth.uid() = categories.user_id)
  );
