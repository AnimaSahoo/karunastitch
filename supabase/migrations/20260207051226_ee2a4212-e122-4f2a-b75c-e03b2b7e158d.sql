-- Add shoulder column for new measurement guide
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shoulder text;