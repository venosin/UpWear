-- ============================================
-- MCP VALIDATION SCRIPT FOR UPWEAR
-- Verificación de tablas principales
-- ============================================

-- Verificar tablas principales
SELECT
    'Tables Validation' as test_type,
    COUNT(*) as total_tables,
    COUNT(*) FILTER (WHERE table_exists) as tables_exist,
    COUNT(*) FILTER (WHERE NOT table_exists) as tables_missing
FROM (
    SELECT
        EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tab
        ) as table_exists
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
    ]) as tab
) AS table_check;

-- Verificar columnas específicas de site_settings
SELECT
    'site_settings columns' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'site_settings'
ORDER BY ordinal_position;

-- Verificar enums necesarios
SELECT
    'Enums Check' as test_type,
    typname as enum_name,
    'EXISTS' as status
FROM pg_type
WHERE typname IN ('discount_type', 'inventory_change_type', 'setting_value_type')
UNION ALL
SELECT
    'Missing Enums' as test_type,
    'discount_type' as enum_name,
    CASE WHEN NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN 'MISSING' END as status
UNION ALL
SELECT
    'Missing Enums' as test_type,
    'inventory_change_type' as enum_name,
    CASE WHEN NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_change_type') THEN 'MISSING' END as status
UNION ALL
SELECT
    'Missing Enums' as test_type,
    'setting_value_type' as enum_name,
    CASE WHEN NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'setting_value_type') THEN 'MISSING' END as status;

-- Verificar RLS en tablas principales
SELECT
    'RLS Check' as test_type,
    schemaname||'.'||tablename as table_name,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('site_settings', 'coupons', 'coupon_usage', 'analytics_events', 'admin_activity_logs', 'inventory_logs')
ORDER BY tablename;