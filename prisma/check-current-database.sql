-- BusinessFlow SaaS - Database Status Check
-- Run this script in Supabase SQL Editor and share the output

-- ============================================
-- 1. LIST ALL EXISTING TABLES
-- ============================================
SELECT '===== EXISTING TABLES =====' as section;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 2. CHECK SPECIFIC TABLES WE NEED
-- ============================================
SELECT '===== CHECKING REQUIRED TABLES =====' as section;
WITH required_tables AS (
    SELECT unnest(ARRAY[
        -- Core Tables (should exist)
        'Organization', 'User', 'Service', 'Booking', 'Revenue',
        -- Missing Tables we need to create
        'Customer', 'Location',
        'ChatSession', 'ChatMessage',
        'PlaidConnection', 'PayrollRun', 'PayrollPayment',
        'MarketingCampaign', 'MarketingContact', 'CampaignActivity', 'ContactPreference',
        'AdAccount', 'AdCampaign',
        'Expense', 'ExpenseCategory', 'Budget',
        'WhiteLabelSettings',
        'AuditLog', 'TwoFactorAuth'
    ]) as table_name
)
SELECT 
    rt.table_name as "Table Name",
    CASE 
        WHEN t.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as "Status"
FROM required_tables rt
LEFT JOIN information_schema.tables t 
    ON rt.table_name = t.table_name 
    AND t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    CASE WHEN t.table_name IS NULL THEN 0 ELSE 1 END,
    rt.table_name;

-- ============================================
-- 3. CHECK COLUMNS OF EXISTING TABLES
-- ============================================
SELECT '===== EXISTING TABLE STRUCTURES =====' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('Organization', 'User', 'Service', 'Booking', 'Revenue')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 4. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT '===== FOREIGN KEY CONSTRAINTS =====' as section;
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public';

-- ============================================
-- 5. SUMMARY COUNT
-- ============================================
SELECT '===== SUMMARY =====' as section;
SELECT 
    COUNT(*) as "Total Tables",
    COUNT(*) FILTER (WHERE table_name IN ('Organization', 'User', 'Service', 'Booking', 'Revenue')) as "Core Tables",
    COUNT(*) FILTER (WHERE table_name IN ('ChatSession', 'ChatMessage')) as "AI Chat Tables",
    COUNT(*) FILTER (WHERE table_name IN ('PlaidConnection', 'PayrollRun', 'PayrollPayment')) as "Payroll Tables",
    COUNT(*) FILTER (WHERE table_name IN ('MarketingCampaign', 'MarketingContact', 'CampaignActivity', 'ContactPreference')) as "Marketing Tables",
    COUNT(*) FILTER (WHERE table_name IN ('AdAccount', 'AdCampaign')) as "Ad Tables",
    COUNT(*) FILTER (WHERE table_name IN ('Expense', 'ExpenseCategory', 'Budget')) as "Expense Tables",
    COUNT(*) FILTER (WHERE table_name IN ('WhiteLabelSettings')) as "White Label Tables"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';