-- =================================
-- UPWEAR - CORRECCIONES CRITICAS DE SCHEMA
-- =================================

-- 1. Agregar columnas faltantes a PRODUCTS
-- Esto es CRÍTICO para el funcionamiento del e-commerce

ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_regular DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 2. Corregir tabla SIZES
-- Las tallas SON esenciales para un e-commerce de ropa

ALTER TABLE sizes
ADD COLUMN IF NOT EXISTS name VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Actualizar tallas existentes con nombres correctos
UPDATE sizes SET name = 'XS', "order" = 1 WHERE id = 1;
UPDATE sizes SET name = 'S', "order" = 2 WHERE id = 2;
UPDATE sizes SET name = 'M', "order" = 3 WHERE id = 3;
UPDATE sizes SET name = 'L', "order" = 4 WHERE id = 4;
UPDATE sizes SET name = 'XL', "order" = 5 WHERE id = 5;
UPDATE sizes SET name = 'XXL', "order" = 6 WHERE id = 6;

-- Insertar tallas si no existen
INSERT INTO sizes (id, name, "order", is_active) VALUES
(1, 'XS', 1, true),
(2, 'S', 2, true),
(3, 'M', 3, true),
(4, 'L', 4, true),
(5, 'XL', 5, true),
(6, 'XXL', 6, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Corregir tabla PRODUCT_VARIANTS
-- Los colores son FUNDAMENTALES para ropa

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS color_id INTEGER REFERENCES colors(id);

-- 4. Corregir tabla PRODUCT_IMAGES
-- El orden es esencial para galerías de imágenes

ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Crear índices para rendimiento
-- Esto es CRUCIAL para escalabilidad

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(product_id, sort_order);

-- 6. Crear Vistas para consultas comunes
-- Esto mejora rendimiento y simplifica código

CREATE OR REPLACE VIEW product_details AS
SELECT
    p.*,
    c.name as category_name,
    b.name as brand_name,
    COUNT(pv.id) as variant_count,
    COUNT(pi.id) as image_count,
    MIN(pv.price_override) as min_price,
    MAX(pv.price_override) as max_price
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_active = true
WHERE p.is_active = true
GROUP BY p.id, c.name, b.name;

-- 7. Crear funciones útiles
-- Para operaciones comunes de e-commerce

CREATE OR REPLACE FUNCTION get_product_price(p_product_id INTEGER)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MIN(price_override)
         FROM product_variants
         WHERE product_id = p_product_id AND is_active = true),
        (SELECT price_sale FROM products WHERE id = p_product_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_stock(p_product_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(stock_quantity)
         FROM product_variants
         WHERE product_id = p_product_id AND is_active = true),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- =================================
-- VERIFICACIÓN
-- =================================

-- Verificar que todo se creó correctamente
SELECT 'products' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
UNION ALL
SELECT 'sizes' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sizes' AND table_schema = 'public'
ORDER BY table_name, column_name;