-- ============================================
-- MCP: CORRECCIÓN DE ENUMS - UPWEAR
-- Basado en resultados MCP actuales
-- ============================================

-- 1. Crear enum setting_value_type (no existe)
CREATE TYPE setting_value_type AS ENUM ('string', 'number', 'boolean', 'json');

-- 2. Corregir discount_type (agregar free_shipping faltante)
-- PostgreSQL no permite modificar enums, así que recreamos
DROP TYPE IF EXISTS discount_type CASCADE;
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');

-- 3. Verificar todos los enums creados
SELECT 'ENUMS_CORRECTED' as step,
       typname,
       array_agg(enumlabel ORDER BY enumsortorder) as values,
       'CORRECTED' as status
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('discount_type', 'inventory_change_type', 'setting_value_type')
GROUP BY typname
ORDER BY typname;

-- 4. Verificar consistencia con tablas existentes
SELECT 'CONSISTENCY_CHECK' as step,
       'discount_type enum values:',
       string_agg(enumlabel, ', ' ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'discount_type';