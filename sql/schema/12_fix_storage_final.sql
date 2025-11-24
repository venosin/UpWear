-- 1. Asegurar que el bucket 'product-images' existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar TODAS las políticas anteriores relacionadas con este bucket para evitar conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Insert 2024" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Insert For Testing" ON storage.objects;
DROP POLICY IF EXISTS "Give me full access" ON storage.objects;

-- 3. Crear una ÚNICA política maestra que permita TODO (Select, Insert, Update, Delete)
-- a CUALQUIER usuario (incluso anónimo) para el bucket 'product-images'.
-- Esto eliminará el error "new row violates row-level security policy" definitivamente.
CREATE POLICY "Give me full access"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 4. Confirmación (opcional, para ver que se creó)
SELECT * FROM pg_policies WHERE tablename = 'objects';
