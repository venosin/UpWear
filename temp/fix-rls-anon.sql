-- CORRECCIÓN RAPIDA: Permitir acceso anónimo temporalmente
-- Copiar y pegar en el editor SQL de Supabase

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable select for all authenticated users" ON products;
DROP POLICY IF EXISTS "Enable insert for all authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update for all authenticated users" ON products;
DROP POLICY IF EXISTS "Enable full access for variants" ON product_variants;
DROP POLICY IF EXISTS "Enable full access for images" ON product_images;
DROP POLICY IF EXISTS "Enable full access for colors" ON colors;

-- 2. Crear nuevas políticas que permitan acceso anónimo (anon key)
CREATE POLICY "Enable anonymous select for products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable anonymous insert for products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable anonymous update for products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Enable anonymous delete for products" ON products
    FOR DELETE USING (true);

-- 3. Políticas para tablas relacionadas
CREATE POLICY "Enable anonymous access for variants" ON product_variants
    FOR ALL USING (true);

CREATE POLICY "Enable anonymous access for images" ON product_images
    FOR ALL USING (true);

CREATE POLICY "Enable anonymous access for colors" ON colors
    FOR ALL USING (true);

CREATE POLICY "Enable anonymous access for categories" ON categories
    FOR ALL USING (true);

CREATE POLICY "Enable anonymous access for brands" ON brands
    FOR ALL USING (true);

CREATE POLICY "Enable anonymous access for sizes" ON sizes
    FOR ALL USING (true);