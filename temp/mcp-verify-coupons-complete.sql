-- ============================================
-- MCP: VERIFICACIÓN COMPLETA DE TABLAS DE COUPONES
-- ============================================

-- 1. Verificar qué tablas existen
SELECT 'TABLE_EXISTENCE' as verification_type,
       table_name,
       CASE
         WHEN EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = t.table_name
         ) THEN 'EXISTS'
         ELSE 'MISSING'
       END as status
FROM unnest(ARRAY['coupons', 'coupon_usage']) AS t(table_name)
ORDER BY table_name;

-- 2. Estructura completa de la tabla coupons
SELECT 'COUPONS_STRUCTURE' as verification_type,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length,
       numeric_precision,
       numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupons'
ORDER BY ordinal_position;

-- 3. Estructura completa de la tabla coupon_usage
SELECT 'COUPON_USAGE_STRUCTURE' as verification_type,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length,
       numeric_precision,
       numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupon_usage'
ORDER BY ordinal_position;

-- 4. Verificar el enum discount_type
SELECT 'DISCOUNT_TYPE_ENUM' as verification_type,
       enumlabel as enum_value,
       e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'discount_type'
ORDER BY e.enumsortorder;

-- 5. Datos muestra de tabla coupons (limitado a 3 filas)
SELECT 'COUPONS_SAMPLE_DATA' as verification_type,
       id,
       code,
       name,
       description,
       discount_type,
       discount_value,
       minimum_amount,
       usage_limit,
       usage_count,
       is_active,
       created_at
FROM coupons
ORDER BY created_at DESC
LIMIT 3;

-- 6. Datos muestra de tabla coupon_usage (limitado a 3 filas)
SELECT 'COUPON_USAGE_SAMPLE_DATA' as verification_type,
       id,
       coupon_id,
       user_id,
       order_id,
       discount_amount,
       order_total,
       created_at
FROM coupon_usage
ORDER BY created_at DESC
LIMIT 3;

-- 7. Verificar valores nulos problemáticos en coupons
SELECT 'COUPONS_NULL_VALUES' as verification_type,
       'discount_value' as column_name,
       COUNT(*) as total_rows,
       COUNT(discount_value) as non_null_values,
       COUNT(*) - COUNT(discount_value) as null_values
FROM coupons

UNION ALL

SELECT 'COUPONS_NULL_VALUES' as verification_type,
       'discount_type' as column_name,
       COUNT(*) as total_rows,
       COUNT(discount_type) as non_null_values,
       COUNT(*) - COUNT(discount_type) as null_values
FROM coupons

UNION ALL

SELECT 'COUPONS_NULL_VALUES' as verification_type,
       'code' as column_name,
       COUNT(*) as total_rows,
       COUNT(code) as non_null_values,
       COUNT(*) - COUNT(code) as null_values
FROM coupons;

-- 8. Verificar restricciones y foreign keys
SELECT 'CONSTRAINTS' as verification_type,
       tc.constraint_name,
       tc.constraint_type,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('coupons', 'coupon_usage')
AND tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;