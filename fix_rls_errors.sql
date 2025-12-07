-- Clean up existing policies to avoid conflicts
-- Wishlists Table Policies
drop policy if exists "Everyone can view wishlist settings" on public.wishlists;
drop policy if exists "Users can update own wishlist settings" on public.wishlists;
drop policy if exists "Users can insert own wishlist settings" on public.wishlists;

-- Items Table Policies (cleanup old ones if potentially there)
drop policy if exists "Users can view friends items" on public.items;
drop policy if exists "View items if friend or public" on public.items;

-- Categories Table Policies
drop policy if exists "Users can view friends categories" on public.categories;
drop policy if exists "View categories if friend or public" on public.categories;

-- Now Re-create everything safely

-- 1. Ensure Wishlists Table Exists
create table if not exists public.wishlists (
    id uuid references auth.users not null primary key,
    is_public boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.wishlists enable row level security;

-- 2. Create Wishlist Policies
create policy "Everyone can view wishlist settings"
  on public.wishlists for select
  using ( true );

create policy "Users can update own wishlist settings"
  on public.wishlists for update
  using ( auth.uid() = id );

create policy "Users can insert own wishlist settings"
  on public.wishlists for insert
  with check ( auth.uid() = id );

-- 3. Create/Update Items Policy
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
    OR
    (auth.uid() = items.user_id)
  );

-- 4. Create/Update Categories Policy
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

-- 5. Backfill (Safe to run multiple times due to WHERE NOT EXISTS)
insert into public.wishlists (id, is_public)
select id, false from public.profiles
where id not in (select id from public.wishlists);
