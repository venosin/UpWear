-- 1. Habilitar la extensión de storage si no está habilitada (usualmente viene habilitada por defecto)
-- create extension if not exists "storage";

-- 2. Crear el bucket 'products' si no existe (es mejor hacerlo desde la interfaz de Supabase para configurar el acceso público fácilmente)
-- NOTA: Tu bucket se llama 'product-images', así que usa ese nombre.

-- 3. Política para permitir acceso público al bucket 'product-images'
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- 4. INSERTAR la imagen en la tabla 'product_images'
-- Reemplaza 'tu-project-ref' con la referencia real de tu proyecto Supabase
-- Reemplaza 'polo-camisa' con el slug real de tu producto
-- Reemplaza 'polo-shirt.jpg' con el nombre del archivo que subiste

/*
INSERT INTO product_images (product_id, url, alt_text, image_type, order_index)
SELECT id, 'https://zkbqjwwqnctqszijmxdx.supabase.co/storage/v1/object/public/product-images/polo-camisa.webp', 'Polo Shirt', 'main', 0
FROM products
WHERE slug = 'polo-camisa';
*/

-- 5. Actualizar imágenes de categorías (esto sí es en la tabla categories)
/*
UPDATE categories
SET image_url = 'https://zkbqjwwqnctqszijmxdx.supabase.co/storage/v1/object/public/product-images/women.jpg'
WHERE slug = 'womens';
*/
