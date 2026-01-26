-- Create email_sends tracking table for rate limiting
CREATE TABLE public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient rate limit lookups
CREATE INDEX idx_email_sends_order_time ON public.email_sends(order_id, function_name, sent_at DESC);

-- RLS: Only service role can access this table
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

-- No public policies - only edge functions with service role can insert/read