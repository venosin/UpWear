-- ============================================
-- MCP: VERIFICACIÓN EXACTA DE TABLA product_variants
-- ============================================

-- 1. Verificar si la tabla existe
SELECT 'TABLE_EXISTS' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'product_variants'
       ) as exists;

-- 2. Verificar TODAS las columnas existentes
SELECT 'COLUMNS_EXIST' as check_type,
       column_name,
       data_type,
       is_nullable,
       character_maximum_length,
       numeric_precision,
       ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'product_variants'
ORDER BY ordinal_position;

-- 3. Verificar si hay datos de muestra
SELECT 'SAMPLE_CHECK' as check_type,
       COUNT(*) as total_rows
FROM product_variants
LIMIT 1;