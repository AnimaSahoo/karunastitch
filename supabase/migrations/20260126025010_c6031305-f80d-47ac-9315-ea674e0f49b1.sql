-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  overall_experience INTEGER NOT NULL CHECK (overall_experience >= 1 AND overall_experience <= 5),
  fitting_rating INTEGER NOT NULL CHECK (fitting_rating >= 1 AND fitting_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  comments TEXT,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow public to submit feedback
CREATE POLICY "Allow public insert feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Allow public to read feedback (for displaying average ratings, etc.)
CREATE POLICY "Allow public read feedback"
ON public.feedback
FOR SELECT
USING (true);

-- Create index for order lookups
CREATE INDEX idx_feedback_order_id ON public.feedback(order_id);