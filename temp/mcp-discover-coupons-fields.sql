-- ============================================
-- MCP: DESCUBRIR CAMPOS REALES DE TABLA COUPONS
-- ============================================

-- 1. Verificar existencia de la tabla
SELECT 'TABLE_CHECK' as step,
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'coupons'
       ) as table_exists;

-- 2. Obtener TODAS las columnas con sus detalles
SELECT 'ALL_COLUMNS' as step,
       column_name,
       data_type,
       is_nullable,
       column_default,
       ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupons'
ORDER BY ordinal_position;

-- 3. Obtener datos de muestra para ver estructura real
SELECT 'SAMPLE_DATA' as step,
       'Campos presentes en datos reales:' as info;

-- Esta consulta fallback si hay errores
SELECT 'FALLBACK_TEST' as step,
       'Probando campos básicos...' as test;