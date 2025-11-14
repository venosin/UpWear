-- ============================================
-- FUNCIONES Y TRIGGERS ADICIONALES
-- ============================================

-- Función para actualizar stock cuando se crea una orden
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Reducir stock de cada variante en la orden
    UPDATE product_variants pv
    SET stock_quantity = pv.stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
    AND oi.product_variant_id = pv.id
    AND pv.track_inventory = true;

    -- Crear logs de inventario
    INSERT INTO inventory_logs (product_variant_id, change, previous_quantity, new_quantity, reason, reference_id, reference_type, created_by)
    SELECT
        oi.product_variant_id,
        -oi.quantity, -- Cambio negativo (salida)
        pv.stock_quantity + oi.quantity, -- Cantidad anterior
        pv.stock_quantity, -- Nueva cantidad
        'sale'::inventory_change_type,
        oi.id,
        'order_item',
        NEW.created_by
    FROM order_items oi
    JOIN product_variants pv ON oi.product_variant_id = pv.id
    WHERE oi.order_id = NEW.id
    AND pv.track_inventory = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar inventario cuando una orden se marca como pagada
CREATE TRIGGER trigger_update_inventory_on_order
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status != 'paid' AND NEW.status = 'paid')
EXECUTE FUNCTION update_inventory_on_order();

-- Función para devolver stock cuando se cancela una orden
CREATE OR REPLACE FUNCTION restore_inventory_on_order_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    -- Devolver stock si la orden estaba pagada y se cancela
    IF OLD.status IN ('paid', 'processing', 'shipped') AND NEW.status = 'cancelled' THEN
        UPDATE product_variants pv
        SET stock_quantity = pv.stock_quantity + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id
        AND oi.product_variant_id = pv.id
        AND pv.track_inventory = true;

        -- Crear logs de devolución
        INSERT INTO inventory_logs (product_variant_id, change, previous_quantity, new_quantity, reason, reference_id, reference_type, created_by)
        SELECT
            oi.product_variant_id,
            oi.quantity, -- Cambio positivo (entrada)
            pv.stock_quantity - oi.quantity, -- Cantidad anterior
            pv.stock_quantity, -- Nueva cantidad
            'return'::inventory_change_type,
            oi.id,
            'order_item',
            NEW.updated_by
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE oi.order_id = NEW.id
        AND pv.track_inventory = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restore_inventory_on_order_cancellation
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status != 'cancelled' AND NEW.status = 'cancelled')
EXECUTE FUNCTION restore_inventory_on_order_cancellation();

-- Función para actualizar el contador de uso de cupones
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar el contador de uso del cupón
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE id = NEW.coupon_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_coupon_usage
AFTER INSERT ON coupon_usage
FOR EACH ROW
EXECUTE FUNCTION increment_coupon_usage();

-- Función para registrar actividad de admin
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si es un admin o staff
    IF EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ) THEN
        INSERT INTO admin_activity_logs (
            admin_id, action, entity, entity_id,
            old_values, new_values, ip_address
        )
        VALUES (
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
            inet_client_addr()
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para logging de actividad (solo en tablas importantes)
CREATE TRIGGER log_products_activity
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER log_orders_activity
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER log_coupons_activity
AFTER INSERT OR UPDATE OR DELETE ON coupons
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

-- Función para búsqueda de productos avanzada
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT DEFAULT '',
    category_id BIGINT DEFAULT NULL,
    brand_id BIGINT DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    gender product_gender DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(200),
    slug VARCHAR(220),
    price_sale DECIMAL(10,2),
    image_url TEXT,
    brand_name VARCHAR(100),
    category_name VARCHAR(100),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.slug,
        p.price_sale,
        (SELECT url FROM product_images WHERE product_id = p.id AND image_type = 'main' LIMIT 1),
        b.name as brand_name,
        c.name as category_name,
        ts_rank(p.search_vector, plainto_tsquery('english', search_query)) *
        CASE
            WHEN p.is_featured THEN 1.5
            ELSE 1.0
        END as rank
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE
        p.is_active = true
        AND (search_query IS NULL OR search_query = '' OR p.search_vector @@ plainto_tsquery('english', search_query))
        AND (category_id IS NULL OR p.category_id = category_id)
        AND (brand_id IS NULL OR p.brand_id = brand_id)
        AND (min_price IS NULL OR p.price_sale >= min_price)
        AND (max_price IS NULL OR p.price_sale <= max_price)
        AND (gender IS NULL OR p.gender = gender)
    ORDER BY rank DESC, p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Vista para productos con variantes activas
CREATE VIEW products_with_variants AS
SELECT
    p.*,
    COUNT(pv.id) as variant_count,
    COALESCE(SUM(pv.stock_quantity), 0) as total_stock,
    MIN(pv.price_override) as min_variant_price,
    MAX(pv.price_override) as max_variant_price,
    (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'main' LIMIT 1) as primary_image_url
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
WHERE p.is_active = true
GROUP BY p.id;

-- Función para limpiar carritos abandonados
CREATE OR REPLACE FUNCTION cleanup_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Marcar como abandonados los carritos inactivos por más de 30 días
    UPDATE carts
    SET status = 'abandoned'
    WHERE status = 'active'
    AND updated_at < NOW() - INTERVAL '30 days';

    -- Eliminar carritos abandonados de más de 90 días
    DELETE FROM carts
    WHERE status = 'abandoned'
    AND updated_at < NOW() - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentario final
COMMENT ON SCHEMA public IS 'E-commerce database schema for clothing store with comprehensive inventory, orders, and analytics support.';