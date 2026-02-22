-- Add is_received column to items table
ALTER TABLE public.items 
ADD COLUMN is_received boolean DEFAULT false;

-- Create an index for faster sorting
CREATE INDEX items_is_received_idx ON public.items (is_received);
