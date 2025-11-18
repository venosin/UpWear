-- ============================================
-- ENUMS FALTANTES PARA UPWEAR
-- Crear primero los enums necesarios
-- ============================================

-- Validar si existen antes de crear
DO $$
BEGIN
    -- Crear discount_type si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
        CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
        RAISE NOTICE '✅ discount_type enum created';
    ELSE
        RAISE NOTICE '⚠️ discount_type enum already exists';
    END IF;

    -- Crear inventory_change_type si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_change_type') THEN
        CREATE TYPE inventory_change_type AS ENUM (
            'sale', 'restock', 'return', 'adjustment',
            'damage', 'transfer', 'manual_adjustment'
        );
        RAISE NOTICE '✅ inventory_change_type enum created';
    ELSE
        RAISE NOTICE '⚠️ inventory_change_type enum already exists';
    END IF;

    -- Crear setting_value_type si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'setting_value_type') THEN
        CREATE TYPE setting_value_type AS ENUM ('string', 'number', 'boolean', 'json');
        RAISE NOTICE '✅ setting_value_type enum created';
    ELSE
        RAISE NOTICE '⚠️ setting_value_type enum already exists';
    END IF;
END $$;

-- Verificar enums creados
SELECT 'ENUMS_VALIDATION' as step,
       typname as enum_name,
       'CREATED' as status,
       string_agg(unnest(enum_range(NULL::discount_type)), ', ') as values
FROM pg_type
WHERE typname IN ('discount_type', 'inventory_change_type', 'setting_value_type')
GROUP BY typname
ORDER BY typname;