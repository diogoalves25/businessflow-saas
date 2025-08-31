-- Check all tables and their columns in the database

-- 1. List all tables
SELECT '===== ALL TABLES IN DATABASE =====' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Show columns for each main table
SELECT '===== ORGANIZATION TABLE COLUMNS =====' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Organization' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '===== USER TABLE COLUMNS =====' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'User' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '===== SERVICE TABLE COLUMNS =====' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Service' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '===== BOOKING TABLE COLUMNS =====' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Booking' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '===== CUSTOMER TABLE COLUMNS =====' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Customer' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '===== REVENUE TABLE COLUMNS =====' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Revenue' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Show all columns for all tables in one query
SELECT '===== ALL TABLES AND COLUMNS =====' as section;
SELECT 
    t.table_name,
    array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND c.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name;