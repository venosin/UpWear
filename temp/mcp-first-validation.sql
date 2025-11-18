-- ============================================
-- MCP FIRST VALIDATION - UPWEAR SYSTEM
-- Paso 1: Revisar qué existe y qué falta
-- ============================================

-- 1. REVISAR TABLAS EXISTENTES
SELECT 'EXISTING_TABLES' as step,
       table_name,
       'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users', 'profiles', 'categories', 'brands', 'sizes', 'conditions',
  'products', 'product_variants', 'carts', 'cart_items', 'orders',
  'order_items', 'inventory_logs', 'wishlists', 'wishlist_items',
  'coupons', 'coupon_usage', 'analytics_events', 'admin_activity_logs'
)
ORDER BY table_name;

-- 2. REVISAR TABLAS FALTANTES
SELECT 'MISSING_TABLES' as step,
       missing_table,
       'MISSING' as status
FROM unnest(ARRAY[
  'site_settings'
]) AS missing_table
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = missing_table
);

-- 3. REVISAR ENUMS EXISTENTES
SELECT 'EXISTING_ENUMS' as step,
       typname as enum_name,
       'EXISTS' as status
FROM pg_type
WHERE typname IN ('discount_type', 'inventory_change_type', 'setting_value_type')
ORDER BY typname;

-- 4. REVISAR ENUMS FALTANTES
SELECT 'MISSING_ENUMS' as step,
       missing_enum,
       'MISSING' as status
FROM unnest(ARRAY[
  'discount_type',
  'inventory_change_type',
  'setting_value_type'
]) AS missing_enum
WHERE NOT EXISTS (
  SELECT 1 FROM pg_type WHERE typname = missing_enum
);

-- 5. REVISAR ESTRUCTURA DE TABLAS EXISTENTES
SELECT 'TABLE_STRUCTURE' as step,
       table_name,
       column_count
FROM (
  SELECT
    table_name,
    COUNT(*) as column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name IN ('coupons', 'coupon_usage', 'analytics_events', 'admin_activity_logs', 'inventory_logs')
  GROUP BY table_name
) structure
ORDER BY table_name;

-- 6. REVISAR RLS STATUS
SELECT 'RLS_STATUS' as step,
       schemaname||'.'||tablename as table_name,
       rowsecurity as rls_enabled,
       CASE
         WHEN rowsecurity THEN 'PROTECTED'
         ELSE 'UNPROTECTED'
       END as security_level
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'profiles', 'categories', 'brands', 'products',
  'product_variants', 'orders', 'order_items', 'coupons',
  'coupon_usage', 'analytics_events', 'admin_activity_logs'
)
ORDER BY tablename;

-- 7. DATOS SAMPLE - VERIFICAR CONEXIÓN
SELECT 'CONNECTION_TEST' as step,
       'CONNECTED' as status,
       COUNT(*) as total_tables,
       NOW() as timestamp
FROM information_schema.tables
WHERE table_schema = 'public';