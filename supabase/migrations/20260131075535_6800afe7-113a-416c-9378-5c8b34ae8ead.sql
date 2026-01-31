-- Drop the existing restrictive admin policy and create a permissive one
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Create a permissive policy that only allows admins to view orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));