
-- Create storage bucket for order files (reference images, materials)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload order files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Allow anyone to read order files (public bucket)
CREATE POLICY "Anyone can view order files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'order-files');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own order files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'order-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own order files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'order-files' AND (storage.foldername(name))[1] = auth.uid()::text);
