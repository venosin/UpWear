-- ============================================
-- MCP VALIDATION DIRECTO - UPWEAR SYSTEM
-- Queries directos a la base de datos sin dependencias
-- ============================================

-- 1. VALIDACIÓN DE TABLAS PRINCIPALES
SELECT 'TABLE_VALIDATION' as test_type,
       table_name,
       CASE
         WHEN EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = t.table_name
         ) THEN 'EXISTS'
         ELSE 'MISSING'
       END as status
FROM unnest(ARRAY[
  'site_settings',
  'coupons',
  'coupon_usage',
  'analytics_events',
  'admin_activity_logs',
  'inventory_logs',
  'product_variants',
  'products',
  'categories',
  'brands'
]) AS t(table_name);

-- 2. VALIDACIÓN DE COLUMNAS - SITE_SETTINGS
SELECT 'SITE_SETTINGS_COLUMNS' as test_type,
       column_name,
       data_type,
       is_nullable,
       ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'site_settings'
ORDER BY ordinal_position;

-- 3. VALIDACIÓN DE ESENCIALES - SETTINGS
SELECT 'ESSENTIAL_SETTINGS' as test_type,
       key,
       value,
       value_type,
       is_public
FROM site_settings
WHERE key IN ('site_name', 'site_email', 'currency_code', 'tax_rate')
ORDER BY key;

-- 4. VALIDACIÓN DE COUPONS
SELECT 'COUPONS_VALIDATION' as test_type,
       COUNT(*) as total_coupons,
       COUNT(*) FILTER (WHERE is_active = true) as active_coupons,
       COUNT(*) FILTER (WHERE valid_to < NOW() AND is_active = true) as expired_active,
       COUNT(*) FILTER (WHERE usage_limit > 0 AND used_count >= usage_limit) as limit_reached
FROM coupons;

-- 5. VALIDACIÓN DE INVENTORY INCONSISTENCIES
SELECT 'INVENTORY_CONSISTENCY' as test_type,
       pv.id as variant_id,
       pv.stock_quantity as table_stock,
       COALESCE(il.new_quantity, 0) as latest_log_stock,
       CASE
         WHEN pv.stock_quantity = COALESCE(il.new_quantity, 0) THEN 'CONSISTENT'
         ELSE 'INCONSISTENT'
       END as status
FROM product_variants pv
LEFT JOIN LATERAL (
  SELECT new_quantity
  FROM inventory_logs
  WHERE product_variant_id = pv.id
  ORDER BY created_at DESC
  LIMIT 1
) il ON true
WHERE pv.is_active = true
ORDER BY status DESC, pv.id
LIMIT 10;

-- 6. VALIDACIÓN DE ENUMS
SELECT 'ENUMS_VALIDATION' as test_type,
       typname as enum_name,
       'EXISTS' as status
FROM pg_type
WHERE typname IN ('discount_type', 'inventory_change_type', 'setting_value_type')
UNION ALL
SELECT 'MISSING_ENUMS' as test_type,
       enum_name,
       'MISSING' as status
FROM unnest(ARRAY['discount_type', 'inventory_change_type', 'setting_value_type']) AS enum_name
WHERE NOT EXISTS (
  SELECT 1 FROM pg_type WHERE typname = enum_name
);

-- 7. VALIDACIÓN DE RLS POLICIES
SELECT 'RLS_VALIDATION' as test_type,
       schemaname||'.'||tablename as table_full_name,
       rowsecurity as rls_enabled,
       CASE
         WHEN rowsecurity THEN 'PROTECTED'
         ELSE 'VULNERABLE'
       END as security_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('site_settings', 'coupons', 'coupon_usage', 'analytics_events', 'admin_activity_logs', 'inventory_logs')
ORDER BY tablename;

-- 8. VALIDACIÓN DE DATOS - ANALYTICS
SELECT 'ANALYTICS_SUMMARY' as test_type,
       (SELECT COUNT(*) FROM analytics_events) as total_events,
       (SELECT COUNT(*) FROM admin_activity_logs) as total_admin_logs,
       (SELECT COUNT(*) FROM analytics_events WHERE created_at >= CURRENT_DATE) as events_today,
       (SELECT COUNT(DISTINCT event_type) FROM analytics_events) as unique_event_types;

-- 9. VALIDACIÓN DE PERFORMANCE - ÍNDICES IMPORTANTES
SELECT 'INDEXES_VALIDATION' as test_type,
       schemaname||'.'||tablename as table_name,
       index_count
FROM (
  SELECT
    schemaname,
    tablename,
    COUNT(*) as index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'coupons', 'analytics_events')
  GROUP BY schemaname, tablename
) idx_summary
ORDER BY index_count DESC;

-- 10. VALIDACIÓN FINAL - RESUMEN
SELECT 'FINAL_SUMMARY' as test_type,
       'VALIDATION_COMPLETE' as status,
       NOW() as timestamp,
       version() as postgres_version;