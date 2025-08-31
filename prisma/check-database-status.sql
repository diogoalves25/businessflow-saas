-- BusinessFlow SaaS - Complete Database Status Check
-- Run this script and share the output with me

-- ============================================
-- 1. BASIC DATABASE INFO
-- ============================================
SELECT '===== DATABASE CONNECTION INFO =====' as section;
SELECT current_database() as "Database Name", 
       current_user as "Connected User",
       version() as "PostgreSQL Version";

-- ============================================
-- 2. LIST ALL TABLES
-- ============================================
SELECT '===== ALL TABLES IN DATABASE =====' as section;
SELECT 
    table_name as "Table Name",
    pg_size_pretty(pg_total_relation_size('"'||table_name||'"')) as "Size"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 3. COUNT TABLES BY FEATURE
-- ============================================
SELECT '===== TABLE COUNT BY FEATURE =====' as section;
SELECT 
    'Total Tables' as "Category", 
    COUNT(*) as "Count"
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 'Core Tables (Org/User/Service/Booking/Revenue)', 
    COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('Organization', 'User', 'Service', 'Booking', 'Revenue')

UNION ALL

SELECT 'AI Chat Tables', 
    COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('ChatSession', 'ChatMessage')

UNION ALL

SELECT 'Expense Tables', 
    COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('Expense', 'ExpenseCategory', 'Budget')

UNION ALL

SELECT 'White Label Tables', 
    COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name = 'WhiteLabelSettings';

-- ============================================
-- 4. CHECK SPECIFIC TABLES EXISTENCE
-- ============================================
SELECT '===== CHECKING ALL EXPECTED TABLES =====' as section;
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        -- Core Tables
        'Organization', 'User', 'Service', 'Booking', 'Revenue', 'Customer', 'Location',
        -- AI Chat
        'ChatSession', 'ChatMessage',
        -- Payroll
        'PlaidConnection', 'PayrollRun', 'PayrollPayment',
        -- Marketing
        'MarketingCampaign', 'MarketingContact', 'CampaignActivity', 'ContactPreference',
        -- Ads
        'AdAccount', 'AdCampaign',
        -- Expenses
        'Expense', 'ExpenseCategory', 'Budget',
        -- White Label
        'WhiteLabelSettings',
        -- Security
        'AuditLog', 'TwoFactorAuth'
    ]) as table_name
)
SELECT 
    et.table_name as "Expected Table",
    CASE 
        WHEN t.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as "Status"
FROM expected_tables et
LEFT JOIN information_schema.tables t 
    ON et.table_name = t.table_name 
    AND t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    CASE WHEN t.table_name IS NULL THEN 0 ELSE 1 END,
    et.table_name;

-- ============================================
-- 5. CHECK COLUMNS FOR EXISTING TABLES
-- ============================================
SELECT '===== ORGANIZATION TABLE COLUMNS =====' as section;
SELECT 
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_name = 'Organization'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '===== USER TABLE COLUMNS =====' as section;
SELECT 
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_name = 'User'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 6. CHECK ENUMS
-- ============================================
SELECT '===== CUSTOM ENUM TYPES =====' as section;
SELECT 
    n.nspname as schema,
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY n.nspname, t.typname;

-- ============================================
-- 7. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT '===== FOREIGN KEY CONSTRAINTS =====' as section;
SELECT 
    tc.table_name as "Table",
    kcu.column_name as "Column", 
    ccu.table_name AS "References Table",
    ccu.column_name AS "References Column"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 8. CHECK INDEXES
-- ============================================
SELECT '===== INDEXES (First 20) =====' as section;
SELECT 
    tablename as "Table",
    indexname as "Index Name",
    indexdef as "Definition"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname
LIMIT 20;

-- ============================================
-- 9. CHECK TRIGGERS
-- ============================================
SELECT '===== TRIGGERS =====' as section;
SELECT 
    trigger_name as "Trigger",
    event_object_table as "Table",
    action_timing as "Timing",
    event_manipulation as "Event"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 10. SUMMARY
-- ============================================
SELECT '===== FINAL SUMMARY =====' as section;
SELECT 
    'Ready for Production' as "Status",
    COUNT(*) as "Total Tables",
    COUNT(*) FILTER (WHERE table_name LIKE '%Session%' OR table_name LIKE '%Message%') as "Chat Tables",
    COUNT(*) FILTER (WHERE table_name LIKE '%Expense%' OR table_name LIKE '%Budget%') as "Finance Tables",
    COUNT(*) FILTER (WHERE table_name LIKE '%Marketing%' OR table_name LIKE '%Campaign%' OR table_name LIKE '%Contact%') as "Marketing Tables"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';