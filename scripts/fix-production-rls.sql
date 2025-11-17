-- 🚨 SCRIPT DE EMERGENCIA PARA PRODUCCIÓN
-- Ejecutar SOLO si hay políticas inseguras activas

-- 1. Eliminar políticas peligrosas (si existen)
DROP POLICY IF EXISTS "Enable anonymous access" ON public.products;
DROP POLICY IF EXISTS "Enable anonymous access" ON public.product_variants;
DROP POLICY IF EXISTS "Enable anonymous access" ON public.product_images;
DROP POLICY IF EXISTS "Enable anonymous access" ON public.categories;
DROP POLICY IF EXISTS "Enable anonymous access" ON public.brands;
DROP POLICY IF EXISTS "Enable anonymous access" ON public.colors;
DROP POLICY IF EXISTS "Enable anonymous access" ON public.sizes;

-- 2. Eliminar políticas temporales inseguras
DROP POLICY IF EXISTS "Users can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Users can manage brands" ON public.brands;

-- 3. Asegurar que solo las políticas seguras existan
-- Estas son las políticas CORRECTAS para producción:

-- Products: Solo usuarios autenticados pueden ver productos activos
CREATE POLICY "Users can view active products" ON public.products
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        is_active = true
    );

-- Products: Solo admins pueden gestionar productos
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Categories: Solo usuarios autenticados pueden ver categorías activas
CREATE POLICY "Users can view active categories" ON public.categories
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        is_active = true
    );

-- Categories: Solo admins pueden gestionar categorías
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Brands: Solo usuarios autenticados pueden ver marcas activas
CREATE POLICY "Users can view active brands" ON public.brands
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        is_active = true
    );

-- Brands: Solo admins pueden gestionar marcas
CREATE POLICY "Admins can manage brands" ON public.brands
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Product Images: ACCESO PÚBLICO (deseado para catálogos)
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (is_active = true);

-- Product Images: Solo admins pueden gestionar imágenes
CREATE POLICY "Admins can manage product images" ON public.product_images
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- 4. Verificar estado final
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;