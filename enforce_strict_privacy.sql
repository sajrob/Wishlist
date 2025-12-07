-- Update RLS policies to strictly enforce "Public" visibility
-- Previous logic allowed Friends to bypass the Public check.
-- New logic: You can only see items if:
-- 1. You are the Owner
-- 2. OR The Wishlist is strictly marked as Public (is_public = true)

-- Items Policy
drop policy if exists "View items if friend or public" on public.items;

create policy "Items are visible if public or owner"
  on public.items for select
  using (
    (auth.uid() = items.user_id)
    OR
    exists (
      select 1 from public.wishlists
      where id = items.user_id and is_public = true
    )
  );

-- Categories Policy
drop policy if exists "View categories if friend or public" on public.categories;

create policy "Categories are visible if public or owner"
  on public.categories for select
  using (
    (auth.uid() = categories.user_id)
    OR
    exists (
      select 1 from public.wishlists
      where id = categories.user_id and is_public = true
    )
  );
