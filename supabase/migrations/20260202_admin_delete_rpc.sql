-- ==============================================================================
-- ADMIN FUNCTION: Securely delete a wishlist
-- Description: Uncategorizes items (keeps them) and deletes the category.
-- Access: Restricted to Admins only.
-- ==============================================================================

CREATE OR REPLACE FUNCTION admin_delete_wishlist(target_category_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Use owner's permissions (bypass RLS)
SET search_path = public
AS $$
BEGIN
  -- 1. Check if the executor is actually an admin
  -- (Though RLS on this function should also limit execution, this is a safety check)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only admins can perform this action';
  END IF;

  -- 2. Uncategorize items (Move to "All Items")
  -- This preserves the items but removes their association with the wishlist
  UPDATE items
  SET category_id = NULL
  WHERE category_id = target_category_id;

  -- 3. Delete the category
  DELETE FROM categories
  WHERE id = target_category_id;
END;
$$;
