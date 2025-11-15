-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'upwear-images',
  'upwear-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the bucket
-- Public access to read images
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'upwear-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated Insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'upwear-images' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can update their images
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'upwear-images' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can delete their images
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'upwear-images' AND
  auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;