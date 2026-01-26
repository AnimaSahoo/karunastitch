-- Drop the restrictive policy and recreate as explicitly permissive
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders" 
ON public.orders 
AS PERMISSIVE
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);