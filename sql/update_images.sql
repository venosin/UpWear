-- 1. Habilitar la extensión de storage si no está habilitada (usualmente viene habilitada por defecto)
-- create extension if not exists "storage";

-- 2. Crear el bucket 'products' si no existe (es mejor hacerlo desde la interfaz de Supabase para configurar el acceso público fácilmente)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 3. Política para permitir acceso público al bucket 'products'
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- 4. INSERTAR la imagen en la tabla 'product_images'
-- Reemplaza 'tu-project-ref' con la referencia real de tu proyecto Supabase
-- Reemplaza 'polo-camisa' con el slug real de tu producto
-- Reemplaza 'polo-shirt.jpg' con el nombre del archivo que subiste

/*
INSERT INTO product_images (product_id, url, alt_text, image_type, order_index)
SELECT id, 'https://zkbqjwwqnctqszijmxdx.supabase.co/storage/v1/object/public/products/polo-camisa.webp', 'Polo Shirt', 'main', 0
FROM products
WHERE slug = 'polo-camisa';
*/

-- 5. Actualizar imágenes de categorías (esto sí es en la tabla categories)
/*
UPDATE categories
SET image_url = 'https://zkbqjwwqnctqszijmxdx.supabase.co/storage/v1/object/public/products/women.jpg'
WHERE slug = 'womens';
*/
