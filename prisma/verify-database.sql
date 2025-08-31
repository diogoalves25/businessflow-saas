-- BusinessFlow SaaS - Database Verification Script
-- Run this after seeding to verify everything is set up correctly

-- Check if all required columns were added
SELECT 
    'Organization' as table_name,
    COUNT(*) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'Organization' 
AND column_name IN ('stripeSubscriptionId', 'stripePriceId', 'subscriptionStatus', 'trialEndsAt', 'notificationPreferences', 'aiTokensUsed')

UNION ALL

SELECT 
    'User' as table_name,
    COUNT(*) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name = 'hourlyRate'

UNION ALL

SELECT 
    'Service' as table_name,
    COUNT(*) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'Service' 
AND column_name = 'isActive'

UNION ALL

SELECT 
    'Booking' as table_name,
    COUNT(*) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'Booking' 
AND column_name IN ('confirmationSentAt', 'reminderSentAt', 'userId', 'locationId')

UNION ALL

SELECT 
    'Revenue' as table_name,
    COUNT(*) as new_columns_count
FROM information_schema.columns 
WHERE table_name = 'Revenue' 
AND column_name IN ('organizationId', 'bookingId', 'date', 'type');

-- Check seeded data counts
SELECT 
    'Data Summary' as category,
    'Organizations' as item,
    COUNT(*) as count
FROM "Organization"
WHERE email IN ('admin@sparkleclean.com', 'admin@quickfixplumbing.com', 'admin@brightdental.com')

UNION ALL

SELECT 
    'Data Summary' as category,
    'Users' as item,
    COUNT(*) as count
FROM "User"
WHERE "organizationId" IS NOT NULL

UNION ALL

SELECT 
    'Data Summary' as category,
    'Services' as item,
    COUNT(*) as count
FROM "Service"

UNION ALL

SELECT 
    'Data Summary' as category,
    'Bookings' as item,
    COUNT(*) as count
FROM "Booking"

UNION ALL

SELECT 
    'Data Summary' as category,
    'Revenue Records' as item,
    COUNT(*) as count
FROM "Revenue";

-- Show sample data
SELECT 
    'Sample Organizations:' as info;
    
SELECT 
    name,
    "businessType",
    email,
    "subscriptionStatus",
    "subscriptionTier"
FROM "Organization"
LIMIT 3;

SELECT 
    'Sample Users:' as info;
    
SELECT 
    u.email,
    u.role,
    u."firstName" || ' ' || u."lastName" as full_name,
    o.name as organization
FROM "User" u
LEFT JOIN "Organization" o ON u."organizationId" = o.id
WHERE u."organizationId" IS NOT NULL
LIMIT 5;

SELECT 
    'Sample Bookings:' as info;
    
SELECT 
    b.date,
    b.time,
    b.status,
    s.name as service,
    u.email as customer_email
FROM "Booking" b
JOIN "Service" s ON b."serviceId" = s.id
JOIN "User" u ON b."customerId" = u.id
LIMIT 5;