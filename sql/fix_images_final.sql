-- 1. LIMPIEZA: Borrar todas las imágenes asociadas al producto 'polo-camisa' para empezar de cero
-- Esto eliminará las URLs incorrectas que causan el error 400
DELETE FROM product_images
WHERE product_id IN (SELECT id FROM products WHERE slug = 'polo-camisa');

-- 2. INSERCIÓN CORRECTA: Insertar la imagen apuntando al bucket 'product-images'
-- Asegúrate de que el nombre del archivo 'polo-camisa.webp' sea correcto
INSERT INTO product_images (product_id, url, alt_text, image_type, order_index)
SELECT id, 'https://zkbqjwwqnctqszijmxdx.supabase.co/storage/v1/object/public/product-images/polo-camisa.webp', 'Polo Shirt', 'main', 0
FROM products
WHERE slug = 'polo-camisa';

-- 3. VERIFICACIÓN (Opcional): Ver qué quedó en la tabla
SELECT * FROM product_images WHERE product_id IN (SELECT id FROM products WHERE slug = 'polo-camisa');
