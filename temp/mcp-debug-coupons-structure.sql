-- ============================================
-- MCP: DEPURACIÓN EXACTA DE TABLA COUPONS
-- ============================================

-- 1. Verificar estructura completa de la tabla coupons
SELECT 'COUPONS_STRUCTURE' as debug_type,
       column_name,
       data_type,
       is_nullable,
       column_default,
       character_maximum_length,
       numeric_precision,
       numeric_scale,
       ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupons'
ORDER BY ordinal_position;

-- 2. Verificar constraints de la tabla
SELECT 'COUPONS_CONSTRAINTS' as debug_type,
       tc.constraint_name,
       tc.constraint_type,
       kcu.column_name,
       rc.match_option,
       rc.update_rule,
       rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name = 'coupons'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Verificar los datos existentes para ver la estructura real
SELECT 'EXISTING_COUPONS_SAMPLE' as debug_type,
       id,
       code,
       name,
       description,
       discount_type,
       discount_value,
       minimum_amount,
       usage_limit,
       used_count,
       is_active,
       created_at
FROM coupons
ORDER BY created_at DESC
LIMIT 2;

-- 4. Probar inserción mínima para ver qué campos son realmente requeridos
SELECT 'MINIMAL_INSERT_TEST' as debug_type,
       'Testing minimal required fields...';