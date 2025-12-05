-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Create items table
create table items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  category_id uuid references categories(id),
  name text not null,
  price numeric,
  description text,
  image_url text,
  buy_link text,
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table categories enable row level security;
alter table items enable row level security;

-- Policies for categories
create policy "Users can view their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- Policies for items
create policy "Users can view their own items"
  on items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own items"
  on items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on items for delete
  using (auth.uid() = user_id);
