-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create Public Profiles Table
-- This table mirrors auth.users data that is safe to be public
create table if not exists public.profiles (
    id uuid references auth.users not null primary key,
    email text,
    first_name text,
    last_name text,
    full_name text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Profiles
alter table public.profiles enable row level security;

-- Drop existing policies if they exist to avoid errors
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Create Friends/Follows Table
create table if not exists public.friends (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) not null,
    friend_id uuid references public.profiles(id) not null,
    status text default 'accepted', -- For now, auto-accept to simplify. Could be 'pending' later.
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(user_id, friend_id),
    constraint not_self_friend check (user_id != friend_id)
);

-- RLS for Friends
alter table public.friends enable row level security;

drop policy if exists "Users can see their own friends." on public.friends;
drop policy if exists "Users can add friends." on public.friends;
drop policy if exists "Users can remove friends." on public.friends;

create policy "Users can see their own friends."
  on public.friends for select
  using ( auth.uid() = user_id or auth.uid() = friend_id );

create policy "Users can add friends."
  on public.friends for insert
  with check ( auth.uid() = user_id );

create policy "Users can remove friends."
  on public.friends for delete
  using ( auth.uid() = user_id );

-- 3. Automatic Profile Creation Trigger
-- This ensures that when a new user signs up via Supabase Auth, 
-- a row is automatically created in public.profiles.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Update Wishlist Items & Categories RLS to allow Friends to View
-- Policies for items and categories
drop policy if exists "Users can view friends items" on public.items;
drop policy if exists "Users can view friends categories" on public.categories;

-- Policy for items: "Users can view items from their friends"
create policy "Users can view friends items"
  on public.items for select
  using (
    exists (
      select 1 from public.friends
      where (user_id = auth.uid() and friend_id = items.user_id) -- I am adding them as friend
    )
  );

-- Policy for categories: "Users can view friends categories"
create policy "Users can view friends categories"
  on public.categories for select
  using (
    exists (
      select 1 from public.friends
      where (user_id = auth.uid() and friend_id = categories.user_id)
    )
  );
