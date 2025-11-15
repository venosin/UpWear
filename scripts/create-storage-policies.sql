-- Disable RLS temporarily to create bucket
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Allow anonymous access for development (you'll want to restrict this in production)
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR ALL USING (bucket_id = 'upwear-images');

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant anonymous access to storage schema (for development)
GRANT ALL ON SCHEMA storage TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon;