-- Remove the dangerous "Anyone can view orders" policy that exposes all customer PII
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;