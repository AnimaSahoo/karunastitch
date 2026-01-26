-- Drop and recreate both policies as explicitly PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Allow anonymous and authenticated users to insert orders
CREATE POLICY "Anyone can create orders" ON public.orders 
AS PERMISSIVE FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow anonymous and authenticated users to view orders (needed for .select().single())
CREATE POLICY "Anyone can view orders" ON public.orders 
AS PERMISSIVE FOR SELECT 
TO anon, authenticated 
USING (true);