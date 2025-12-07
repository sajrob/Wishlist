-- 1. Add is_public to Categories
alter table public.categories 
add column if not exists is_public boolean default false;

-- 2. Update Categories Update Policy (allow owners to update the flag)
-- (Existing "Users can update own categories" policy usually covers all columns, but let's verify if we need detailed pols)
-- Usually standard setup covers it.

-- 3. Update Categories Select Policy (Public Visibility)
drop policy if exists "Categories are visible if public or owner" on public.categories;

create policy "Categories are visible if public or owner"
  on public.categories for select
  using (
    (auth.uid() = user_id) -- Owner
    OR
    (is_public = true) -- Category is explicitly Public
  );


-- 4. Update Items Policy (Item visibility inherits from Category OR Wishlist(Uncategorized))
drop policy if exists "Items are visible if public or owner" on public.items;

create policy "Items visible via Category or Wishlist"
  on public.items for select
  using (
    (auth.uid() = user_id) -- Owner
    OR
    (
      -- Item is in a Public Category
      exists (
        select 1 from public.categories
        where id = items.category_id
        and is_public = true
      )
    )
    OR
    (
      -- Item is Uncategorized AND the Main Wishlist (Uncategorized bucket) is Public
      items.category_id is null 
      AND 
      exists (
        select 1 from public.wishlists
        where id = items.user_id
        and is_public = true
      )
    )
  );

-- 5. We keep the 'wishlists' table to serve as the "Uncategorized/Main" settings.
-- logic: wishlists.is_public now strictly controls items with NO category.
