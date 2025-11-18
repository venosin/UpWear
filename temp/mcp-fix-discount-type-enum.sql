-- ============================================
-- MCP: CORRECCIÓN DE ENUM DISCOUNT_TYPE
-- El enum existe pero no tiene los valores correctos
-- ============================================

-- 1. Verificar qué valores tiene actualmente el enum
SELECT 'CURRENT_VALUES' as step,
       enumlabel as current_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'discount_type'
ORDER BY e.enumsortorder;

-- 2. Necesitamos recrear el enum con los valores correctos
-- PostgreSQL no permite modificar enums existentes directamente,
-- así que necesitamos crear uno nuevo y actualizar las referencias

-- Crear nuevo enum con valores correctos
CREATE TYPE discount_type_new AS ENUM ('percentage', 'fixed_amount', 'free_shipping');

-- 3. Verificar que el nuevo enum tenga los valores correctos
SELECT 'NEW_ENUM_VALUES' as step,
       enumlabel as new_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'discount_type_new'
ORDER BY e.enumsortorder;

-- 4. Si la tabla coupons existe, necesitamos actualizarla para usar el nuevo enum
-- Primero, eliminar la tabla coupons si existe (para poder cambiar el tipo de columna)
DROP TABLE IF EXISTS coupons CASCADE;

-- 5. Recrear la tabla coupons con el enum correcto
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Tipo y valor del descuento (ahora usando el enum correcto)
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

-- 6. Crear tabla de uso de cupones
CREATE TABLE coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID,
    order_id BIGINT,
    discount_amount DECIMAL(10,2) NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Evitar uso duplicado del mismo cupón en la misma orden
    UNIQUE(coupon_id, order_id)
);

-- 7. Índices para optimización
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_to ON coupons(valid_to);

-- 8. Trigger para actualizar timestamp (si existe la función)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_timestamp') THEN
        CREATE TRIGGER set_coupons_timestamp
        BEFORE UPDATE ON coupons
        FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    END IF;
END $$;

-- 9. Validación final
SELECT 'FINAL_VALIDATION' as step,
       'DISCOUNT_TYPE_ENUM_FIXED' as status,
       'COUPONS_TABLE_CREATED' as table_status;