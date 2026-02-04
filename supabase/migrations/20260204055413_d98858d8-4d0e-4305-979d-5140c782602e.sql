-- Drop the existing public read policy on feedback
DROP POLICY IF EXISTS "Allow public read feedback" ON public.feedback;

-- Create new policy allowing only admins to view feedback
CREATE POLICY "Admins can view feedback" 
ON public.feedback 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));