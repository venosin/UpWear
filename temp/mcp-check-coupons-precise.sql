-- ============================================
-- MCP: VERIFICACIÓN PRECISA DE COUPONS
-- Basado en los errores 400 que indican columnas incorrectas
-- ============================================

-- 1. Verificar si la tabla coupons existe exactamente
SELECT 'COUPONS_EXISTENCE' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'coupons'
       ) as table_exists;

-- 2. Si existe, verificar qué columnas tiene
SELECT 'COUPONS_COLUMNS' as check_type,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupons'
ORDER BY ordinal_position;

-- 3. Verificar si existe el enum discount_type con los valores correctos
SELECT 'DISCOUNT_TYPE_ENUM' as check_type,
       enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'discount_type'
ORDER BY e.enumsortorder;

-- 4. Verificar si el enum tiene los valores que espera el código
SELECT 'EXPECTED_VS_ACTUAL' as check_type,
       'El código espera' as source,
       enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'discount_type'
AND enumlabel IN ('percentage', 'fixed_amount', 'free_shipping');