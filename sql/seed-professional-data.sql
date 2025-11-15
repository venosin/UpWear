-- =================================
-- UPWEAR - DATOS INICIALES PROFESIONALES
-- =================================

-- 1. Categorías con estructura jerárquica
INSERT INTO categories (id, name, description, parent_id, is_active, created_at) VALUES
-- Categorías principales
(1, 'Ropa', 'Todas las categorías de ropa', NULL, true, NOW()),
(2, 'Calzado', 'Todo tipo de calzado', NULL, true, NOW()),
(3, 'Accesorios', 'Accesorios y complementos', NULL, true, NOW()),

-- Subcategorías de Ropa
(4, 'Camisetas', 'Camisetas y blusas', 1, true, NOW()),
(5, 'Pantalones', 'Pantalones y jeans', 1, true, NOW()),
(6, 'Vestidos', 'Vestidos y faldas', 1, true, NOW()),
(7, 'Chaquetas', 'Chaquetas y abrigos', 1, true, NOW()),
(8, 'Ropa Interior', 'Ropa interior y pijamas', 1, true, NOW()),

-- Subcategorías de Calzado
(9, 'Zapatillas', 'Zapatillas deportivas', 2, true, NOW()),
(10, 'Botas', 'Botas y botines', 2, true, NOW()),
(11, 'Sandalias', 'Sandalias y chanclas', 2, true, NOW()),
(12, 'Zapatos Formales', 'Zapatos para ocasiones especiales', 2, true, NOW())

ON CONFLICT (id) DO NOTHING;

-- 2. Marcas con información completa
INSERT INTO brands (id, name, description, logo_url, is_active, created_at) VALUES
(1, 'UpWear', 'Marca principal de UpWear - Calidad y estilo urbano', '/brands/upwear.png', true, NOW()),
(2, 'Urban Style', 'Estilo urbano moderno para jóvenes', '/brands/urban-style.png', true, NOW()),
(3, 'Classic Fit', 'Ropa clásica y elegante para toda ocasión', '/brands/classic-fit.png', true, NOW()),
(4, 'Sport Pro', 'Ropa deportiva de alta performance', '/brands/sport-pro.png', true, NOW()),
(5, 'Eco Collection', 'Ropa sostenible y ecológica', '/brands/eco-collection.png', true, NOW())

ON CONFLICT (id) DO NOTHING;

-- 3. Colores con valores HEX profesionales
INSERT INTO colors (id, name, hex, is_active, created_at) VALUES
(1, 'Negro Puro', '#000000', true, NOW()),
(2, 'Blanco Nieve', '#FFFFFF', true, NOW()),
(3, 'Gris Humo', '#6B7280', true, NOW()),
(4, 'Azul Marino', '#1E40AF', true, NOW()),
(5, 'Azul Rey', '#2563EB', true, NOW()),
(6, 'Rojo Intenso', '#DC2626', true, NOW()),
(7, 'Borgoña', '#7C2D12', true, NOW()),
(8, 'Verde Bosque', '#14532D', true, NOW()),
(9, 'Verde Menta', '#059669', true, NOW()),
(10, 'Mostaza', '#A16207', true, NOW()),
(11, 'Terracota', '#C2410C', true, NOW()),
(12, 'Rosa Pastel', '#F9A8D4', true, NOW()),
(13, 'Beige', '#E5E5E5', true, NOW()),
(14, 'Plata', '#9CA3AF', true, NOW()),
(15, 'Dorado', '#FDE047', true, NOW())

ON CONFLICT (id) DO NOTHING;

-- 4. Productos de ejemplo completos
INSERT INTO products (
    name, slug, sku, description, short_description,
    price_regular, price_sale, cost_price,
    track_inventory, is_active, is_featured, gender,
    category_id, brand_id, weight, dimensions,
    meta_title, meta_description, created_at
) VALUES
-- Camisetas
('Camiseta Básica Algodón', 'camiseta-basica-algodon', 'UW-TS-001',
'Camiseta confeccionada con algodón 100% de alta calidad. Diseño minimalista perfecto para el día a día. Tejido suave al tacto con excelente transpirabilidad.',
'Camiseta básica de algodón premium',
29.99, 24.99, 12.50, true, true, true, 'unisex', 4, 1, 180, 'M-L',
'Camiseta Básica Algodón | UpWear', 'Camiseta de algodón 100% cómoda y duradera. Ideal para uso diario.',
NOW()),

('Camiseta Gráfica Urban', 'camiseta-grafica-urban', 'US-TS-002',
'Camiseta con diseño gráfico urbano inspirado en el arte callejero. Impresión de alta durabilidad que no se desvanece con los lavados.',
'Camiseta con diseño gráfico urbano',
39.99, 34.99, 18.75, true, true, true, 'unisex', 4, 2, 190, 'M-L',
'Camiseta Gráfica Urban | Urban Style', 'Camiseta con diseño urbano exclusivo. Perfecta para expresar tu estilo.',
NOW()),

('Camiseta Ecológica Bamboo', 'camiseta-ecologica-bamboo', 'EC-TS-001',
'Camiseta fabricada con fibra de bambú sostenible. Propiedades antibacterianas naturales y máxima transpirabilidad. 100% biodegradable.',
'Camiseta ecológica de bambú',
45.99, 39.99, 22.50, true, true, false, 'unisex', 4, 5, 170, 'M-L',
'Camiseta Ecológica Bamboo | Eco Collection', 'Camiseta sostenible de bambú. Suave, transpirable y ecológica.',
NOW()),

-- Pantalones
('Jeans Slim Fit', 'jeans-slim-fit', 'UW-JN-001',
'Pantalón jeans con corte slim fit que se adapta perfectamente al cuerpo. Fabricado en denim de alta calidad con elastáneo para mayor comodidad.',
'Jeans slim fit elastizados',
79.99, 69.99, 35.00, true, true, true, 'men', 5, 1, 280, '32-L',
'Jeans Slim Fit | UpWear', 'Jeans slim fit de alta calidad. Confort y estilo en una sola prenda.',
NOW()),

('Pantalón Chino Clásico', 'pantalon-chino-classico', 'CF-PT-001',
'Pantalón chino de corte clásico confeccionado en gabardina de algodón. Versatil para ocasiones formales e informales.',
'Pantalón chino clásico versátil',
65.99, 59.99, 29.50, true, true, false, 'men', 5, 3, 260, '32-L',
'Pantalón Chino Clásico | Classic Fit', 'Pantalón chino elegante y cómodo. Perfecto para cualquier ocasión.',
NOW()),

-- Chaquetas
('Chaqueta Cuero Sintético', 'chaqueta-cuero-sintetico', 'US-JK-001',
'Chaqueta confeccionada en cuero sintético de alta calidad. Diseño moderno con cremallera resistente y bolsillos funcionales.',
'Chaqueta de cuero sintético moderno',
149.99, 129.99, 75.00, true, true, true, 'unisex', 7, 2, 450, 'M',
'Chaqueta Cuero Sintético | Urban Style', 'Chaqueta moderna de cuero sintético. Estilo urbano con protección.',
NOW()),

('Abrigo Ecológico Lana', 'abrigo-ecologico-lana', 'EC-JK-001',
'Abrigo confeccionado con lana reciclada y materiales sostenibles. Capucha ajustable y forro térmico para máximo confort.',
'Abrigo ecológico de lana reciclada',
189.99, 169.99, 95.00, true, true, false, 'unisex', 7, 5, 680, 'M',
'Abrigo Ecológico Lana | Eco Collection', 'Abrigo sostenible con lana reciclada. Calor consciente con el planeta.',
NOW())

ON CONFLICT (sku) DO NOTHING;

-- 5. Variantes de productos (tallas y stock)
INSERT INTO product_variants (
    product_id, sku, price_override, stock_quantity,
    size_id, is_active, created_at
)
SELECT
    p.id,
    p.sku || '-' || s.name,
    CASE WHEN s.name IN ('L', 'XL', 'XXL') THEN p.price_sale * 1.10 ELSE p.price_sale END,
    CASE
        WHEN s.name = 'XS' THEN 30
        WHEN s.name = 'S' THEN 50
        WHEN s.name = 'M' THEN 75
        WHEN s.name = 'L' THEN 60
        WHEN s.name = 'XL' THEN 40
        WHEN s.name = 'XXL' THEN 20
        ELSE 50
    END,
    s.id,
    true,
    NOW()
FROM products p, sizes s
WHERE p.is_active = true AND s.is_active = true
ON CONFLICT (sku) DO NOTHING;

-- 6. Imágenes de productos
INSERT INTO product_images (
    product_id, url, alt_text, image_type, sort_order, is_active, created_at
) VALUES
-- Camiseta Algodón
(1, '/products/camiseta-basica-frontal.jpg', 'Camiseta básica algodón vista frontal', 'main', 1, true, NOW()),
(1, '/products/camiseta-basica-dorso.jpg', 'Camiseta básica algodón vista trasera', 'gallery', 2, true, NOW()),
(1, '/products/camiseta-basica-detalle.jpg', 'Detalle del tejido de camiseta', 'gallery', 3, true, NOW()),

-- Camiseta Urban
(2, '/products/camiseta-urban-frontal.jpg', 'Camiseta gráfica urban vista frontal', 'main', 1, true, NOW()),
(2, '/products/camiseta-urban-grafico.jpg', 'Detalle del diseño gráfico', 'gallery', 2, true, NOW()),

-- Jeans Slim Fit
(4, '/products/jeans-slim-frontal.jpg', 'Jeans slim fit vista frontal', 'main', 1, true, NOW()),
(4, '/products/jeans-slim-dorso.jpg', 'Jeans slim fit vista trasera', 'gallery', 2, true, NOW()),
(4, '/products/jeans-slim-detalle.jpg', 'Detalle del tejido denim', 'gallery', 3, true, NOW()),

-- Chaqueta Cuero
(6, '/products/chaqueta-cuero-frontal.jpg', 'Chaqueta cuero vista frontal', 'main', 1, true, NOW()),
(6, '/products/chaqueta-cuero-abierta.jpg', 'Chaqueta cuero abierta', 'gallery', 2, true, NOW()),
(6, '/products/chaqueta-cuero-detalle.jpg', 'Detalle de cremallera y bolsillos', 'gallery', 3, true, NOW())

ON CONFLICT (product_id, url) DO NOTHING;

-- =================================
-- VERIFICACIÓN FINAL
-- =================================

-- Contar registros creados
SELECT
    'categories' as table_name, COUNT(*) as total_records FROM categories WHERE is_active = true
UNION ALL
SELECT
    'brands' as table_name, COUNT(*) as total_records FROM brands WHERE is_active = true
UNION ALL
SELECT
    'colors' as table_name, COUNT(*) as total_records FROM colors WHERE is_active = true
UNION ALL
SELECT
    'products' as table_name, COUNT(*) as total_records FROM products WHERE is_active = true
UNION ALL
SELECT
    'product_variants' as table_name, COUNT(*) as total_records FROM product_variants WHERE is_active = true
UNION ALL
SELECT
    'product_images' as table_name, COUNT(*) as total_records FROM product_images WHERE is_active = true
ORDER BY table_name;