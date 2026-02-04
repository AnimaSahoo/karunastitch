-- Drop existing public SELECT policy on orders if it exists
DROP POLICY IF EXISTS "Allow public to view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Create admin-only SELECT policy for orders table
CREATE POLICY "Admins can view orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also add admin-only SELECT policy for email_sends table (missing policies)
CREATE POLICY "Admins can view email sends" 
ON public.email_sends 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));