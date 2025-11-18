-- ============================================
-- MCP: VALIDAR TABLAS FALTANTES - UPWEAR
-- Basado en los errores de la consola
-- ============================================

-- 1. Verificar tabla coupons
SELECT 'COUPONS_TABLE' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'coupons'
       ) as exists;

-- 2. Verificar columnas de coupons (que columnas existen)
SELECT 'COUPONS_COLUMNS' as check_type,
       column_name,
       data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'coupons'
ORDER BY ordinal_position;

-- 3. Verificar tabla customers (el error dice 404)
SELECT 'CUSTOMERS_TABLE' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'customers'
       ) as exists;

-- Si customers no existe, verificar si existe profiles
SELECT 'PROFILES_TABLE' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'profiles'
       ) as exists;

-- 4. Verificar tablas que SÍ existen (que podemos usar)
SELECT 'EXISTING_TABLES' as check_type,
       table_name,
       'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'site_settings', 'products', 'categories', 'brands',
  'orders', 'order_items', 'analytics_events', 'admin_activity_logs'
)
ORDER BY table_name;