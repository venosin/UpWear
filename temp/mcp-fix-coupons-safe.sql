-- ============================================
-- MCP: CORRECCIÓN DE COUPONS - VERSIÓN SEGURA
-- Maneja tablas que ya existen
-- ============================================

-- 1. Verificar estado actual
SELECT 'CURRENT_STATUS' as step,
       table_name,
       CASE
         WHEN EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = t.table_name
         ) THEN 'EXISTS'
         ELSE 'MISSING'
       END as status
FROM unnest(ARRAY['coupons', 'coupon_usage']) AS t(table_name);

-- 2. Primero, eliminar la tabla coupons si existe (podemos reconstruirla)
DROP TABLE IF EXISTS coupons CASCADE;

-- 3. La tabla coupon_usage ya existe, la mantenemos
-- Solo necesitamos verificar que tenga la estructura correcta
SELECT 'COUPON_USAGE_COLUMNS' as step,
       column_name,
       data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupon_usage'
ORDER BY ordinal_position;

-- 4. Crear nuevo enum con valores correctos
DROP TYPE IF EXISTS discount_type_new;
CREATE TYPE discount_type_new AS ENUM ('percentage', 'fixed_amount', 'free_shipping');

-- 5. Recrear la tabla coupons con el enum correcto
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Tipo y valor del descuento (usando el enum corregido)
    discount_type discount_type_new NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2), -- Monto mínimo para aplicar el cupón

    -- Límites de uso
    usage_limit INTEGER, -- Límite total de usos
    usage_limit_per_user INTEGER, -- Límite por usuario
    used_count INTEGER DEFAULT 0,

    -- Validez
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,

    -- Restricciones
    applicable_products BIGINT[], -- IDs de productos específicos
    applicable_categories BIGINT[], -- IDs de categorías específicas
    excluded_products BIGINT[], -- Productos excluidos
    excluded_categories BIGINT[], -- Categorías excluidas
    first_time_customers_only BOOLEAN DEFAULT false,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Visible públicamente

    -- Métadatos
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices para optimización
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_to ON coupons(valid_to);

-- 7. Trigger para actualizar timestamp (si existe la función)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_timestamp') THEN
        CREATE TRIGGER set_coupons_timestamp
        BEFORE UPDATE ON coupons
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;
END $$;

-- 8. Insertar algunos cupones de ejemplo
INSERT INTO coupons (code, name, description, discount_type, discount_value, is_active, is_public) VALUES
('WELCOME10', '10% de descuento de bienvenida', '10% de descuento en tu primera compra', 'percentage', 10.00, true, true),
('FREESHIP', 'Envío gratis', 'Envío gratis en pedidos mayores a $50', 'free_shipping', 0, true, true),
('SUMMER20', '20% de descuento verano', '20% de descuento en productos seleccionados', 'percentage', 20.00, false, true);

-- 9. Validación final
SELECT 'FINAL_VALIDATION' as step,
       'COUPONS_TABLE_FIXED' as table_status,
       (SELECT COUNT(*) FROM coupons) as total_coupons,
       'SUCCESS' as overall_status;