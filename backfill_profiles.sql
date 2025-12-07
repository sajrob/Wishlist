-- 1. Ensure columns exist (fixes missing column errors if table was created before)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists full_name text;

-- 2. Backfill/Sync users from auth.users
insert into public.profiles (id, email, first_name, last_name, full_name)
select 
  id, 
  email, 
  raw_user_meta_data->>'first_name', 
  raw_user_meta_data->>'last_name', 
  raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do update 
set 
  email = excluded.email,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  full_name = excluded.full_name;
