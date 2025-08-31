-- BusinessFlow SaaS - Seed Data (Corrected for actual schema)
-- Run this in Supabase SQL Editor to populate demo data

-- Clean up existing demo data (optional)
DELETE FROM "Booking" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Service" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Customer" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "User" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com');

-- Create Demo Organizations
INSERT INTO "Organization" (
  id, name, "businessType", "businessName", email, phone, address, city, state, "zipCode",
  "stripeCustomerId", "stripeSubscriptionId", "stripePriceId", "subscriptionStatus",
  "trialEndsAt", "createdAt", "updatedAt"
)
VALUES 
  -- Sparkle Clean (Active subscription)
  (
    'org_sparkle_clean_123', 
    'Sparkle Clean Services', 
    'CLEANING', 
    'Sparkle Clean Services LLC',
    'demo@sparkleclean.com', 
    '(214) 555-0100',
    '123 Clean Street',
    'Dallas',
    'TX',
    '75201',
    'cus_sparkle_demo_123', 
    'sub_sparkle_demo_123',
    'price_premium_monthly',
    'active',
    NOW() + INTERVAL '7 days',
    NOW() - INTERVAL '3 months', 
    NOW()
  ),
  -- QuickFix Plumbing (Active subscription)
  (
    'org_quickfix_456', 
    'QuickFix Plumbing', 
    'PLUMBING',
    'QuickFix Plumbing & Repair',
    'demo@quickfixplumbing.com', 
    '(214) 555-0300',
    '789 Plumbing Way',
    'Dallas',
    'TX',
    '75202',
    'cus_quickfix_demo_456',
    'sub_quickfix_demo_456',
    'price_growth_monthly',
    'active',
    NOW() + INTERVAL '10 days',
    NOW() - INTERVAL '2 months',
    NOW()
  ),
  -- Bright Dental (Trial)
  (
    'org_bright_dental_789',
    'Bright Dental Care',
    'DENTAL',
    'Bright Dental Care PC',
    'demo@brightdental.com',
    '(214) 555-0500',
    '555 Dental Plaza',
    'Dallas',
    'TX',
    '75203',
    NULL,
    NULL,
    NULL,
    'trialing',
    NOW() + INTERVAL '14 days',
    NOW() - INTERVAL '1 week',
    NOW()
  );

-- Create Demo Users (owners/employees)
INSERT INTO "User" (id, email, name, password, role, "organizationId", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Users
  ('user_sc_owner', 'demo@sparkleclean.com', 'Sarah Johnson', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'OWNER', 'org_sparkle_clean_123', NOW() - INTERVAL '3 months', NOW()),
  ('user_sc_emp1', 'employee1@sparkleclean.com', 'Mike Davis', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'MEMBER', 'org_sparkle_clean_123', NOW() - INTERVAL '2 months', NOW()),
  -- QuickFix Users
  ('user_qf_owner', 'demo@quickfixplumbing.com', 'John Martinez', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'OWNER', 'org_quickfix_456', NOW() - INTERVAL '2 months', NOW()),
  ('user_qf_emp1', 'tech@quickfixplumbing.com', 'Bob Wilson', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'MEMBER', 'org_quickfix_456', NOW() - INTERVAL '1 month', NOW()),
  -- Bright Dental Users
  ('user_bd_owner', 'demo@brightdental.com', 'Dr. Emily Chen', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'OWNER', 'org_bright_dental_789', NOW() - INTERVAL '1 week', NOW());

-- Create Locations
INSERT INTO "Location" (id, "organizationId", name, address, city, state, "zipCode", "isActive", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Locations
  ('loc_sc_main', 'org_sparkle_clean_123', 'Main Office', '123 Clean Street', 'Dallas', 'TX', '75201', true, NOW() - INTERVAL '3 months', NOW()),
  ('loc_sc_north', 'org_sparkle_clean_123', 'North Dallas', '456 Sparkle Ave', 'Plano', 'TX', '75074', true, NOW() - INTERVAL '2 months', NOW()),
  -- QuickFix Locations
  ('loc_qf_dallas', 'org_quickfix_456', 'Dallas Branch', '789 Plumbing Way', 'Dallas', 'TX', '75202', true, NOW() - INTERVAL '2 months', NOW()),
  -- Bright Dental Location
  ('loc_bd_main', 'org_bright_dental_789', 'Main Clinic', '555 Dental Plaza', 'Dallas', 'TX', '75203', true, NOW() - INTERVAL '1 week', NOW());

-- Create Services
INSERT INTO "Service" (id, "organizationId", name, description, duration, price, "isActive", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Services
  ('svc_sc_basic', 'org_sparkle_clean_123', 'Basic House Cleaning', '2 bed, 2 bath standard clean', 120, 120.00, true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_deep', 'org_sparkle_clean_123', 'Deep Clean', 'Comprehensive deep cleaning service', 240, 250.00, true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_move', 'org_sparkle_clean_123', 'Move In/Out Clean', 'Complete cleaning for moving', 300, 350.00, true, NOW() - INTERVAL '3 months', NOW()),
  -- QuickFix Services
  ('svc_qf_emergency', 'org_quickfix_456', 'Emergency Service', '24/7 emergency plumbing', 60, 150.00, true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_drain', 'org_quickfix_456', 'Drain Cleaning', 'Professional drain cleaning', 90, 125.00, true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_repair', 'org_quickfix_456', 'General Repair', 'Standard plumbing repairs', 120, 175.00, true, NOW() - INTERVAL '2 months', NOW()),
  -- Bright Dental Services
  ('svc_bd_cleaning', 'org_bright_dental_789', 'Teeth Cleaning', 'Regular dental cleaning', 60, 150.00, true, NOW() - INTERVAL '1 week', NOW()),
  ('svc_bd_exam', 'org_bright_dental_789', 'Dental Exam', 'Comprehensive examination', 45, 100.00, true, NOW() - INTERVAL '1 week', NOW());

-- Create Customers
INSERT INTO "Customer" (id, "organizationId", name, email, phone, address, "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Customers
  ('cust_sc_001', 'org_sparkle_clean_123', 'Lisa Thompson', 'lisa.t@email.com', '(214) 555-1001', '100 Main St, Dallas, TX 75201', NOW() - INTERVAL '3 months', NOW()),
  ('cust_sc_002', 'org_sparkle_clean_123', 'Robert Chen', 'rchen@email.com', '(469) 555-1002', '200 Oak Ave, Plano, TX 75074', NOW() - INTERVAL '2 months', NOW()),
  ('cust_sc_003', 'org_sparkle_clean_123', 'Maria Garcia', 'mgarcia@email.com', '(214) 555-1003', '300 Elm St, Dallas, TX 75202', NOW() - INTERVAL '2 months', NOW()),
  ('cust_sc_004', 'org_sparkle_clean_123', 'James Wilson', 'jwilson@email.com', '(469) 555-1004', '400 Pine Rd, Plano, TX 75075', NOW() - INTERVAL '1 month', NOW()),
  ('cust_sc_005', 'org_sparkle_clean_123', 'Amanda Davis', 'adavis@email.com', '(214) 555-1005', '500 Cedar Ln, Dallas, TX 75203', NOW() - INTERVAL '1 month', NOW()),
  -- QuickFix Customers
  ('cust_qf_001', 'org_quickfix_456', 'David Brown', 'dbrown@email.com', '(214) 555-2001', '600 Water St, Dallas, TX 75204', NOW() - INTERVAL '2 months', NOW()),
  ('cust_qf_002', 'org_quickfix_456', 'Jennifer Lee', 'jlee@email.com', '(469) 555-2002', '700 Pipe Ave, Dallas, TX 75205', NOW() - INTERVAL '1 month', NOW()),
  ('cust_qf_003', 'org_quickfix_456', 'Michael Taylor', 'mtaylor@email.com', '(214) 555-2003', '800 Drain Rd, Dallas, TX 75206', NOW() - INTERVAL '3 weeks', NOW()),
  -- Bright Dental Customers
  ('cust_bd_001', 'org_bright_dental_789', 'Sarah Anderson', 'sanderson@email.com', '(214) 555-3001', '900 Smile St, Dallas, TX 75207', NOW() - INTERVAL '1 week', NOW()),
  ('cust_bd_002', 'org_bright_dental_789', 'Tom Martinez', 'tmartinez@email.com', '(214) 555-3002', '1000 Tooth Ave, Dallas, TX 75208', NOW() - INTERVAL '5 days', NOW());

-- Create Bookings
INSERT INTO "Booking" (
  id, "organizationId", "customerId", "serviceId", "userId", "scheduledDate", "scheduledTime", 
  duration, price, status, notes, "createdAt", "updatedAt"
)
VALUES
  -- Today's bookings for Sparkle Clean
  ('book_sc_001', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'user_sc_emp1', CURRENT_DATE, '09:00', 120, 120.00, 'CONFIRMED', 'Regular weekly cleaning', NOW() - INTERVAL '2 days', NOW()),
  ('book_sc_002', 'org_sparkle_clean_123', 'cust_sc_002', 'svc_sc_deep', 'user_sc_emp1', CURRENT_DATE, '14:00', 240, 250.00, 'CONFIRMED', 'Monthly deep clean', NOW() - INTERVAL '1 week', NOW()),
  
  -- Upcoming bookings
  ('book_sc_003', 'org_sparkle_clean_123', 'cust_sc_003', 'svc_sc_basic', 'user_sc_emp1', CURRENT_DATE + INTERVAL '1 day', '10:00', 120, 120.00, 'CONFIRMED', NULL, NOW() - INTERVAL '3 days', NOW()),
  ('book_sc_004', 'org_sparkle_clean_123', 'cust_sc_004', 'svc_sc_basic', 'user_sc_emp1', CURRENT_DATE + INTERVAL '2 days', '11:00', 120, 120.00, 'CONFIRMED', 'First time customer', NOW() - INTERVAL '1 day', NOW()),
  
  -- Historical bookings (for revenue data)
  ('book_sc_hist_001', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'user_sc_emp1', CURRENT_DATE - INTERVAL '7 days', '09:00', 120, 120.00, 'COMPLETED', NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('book_sc_hist_002', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'user_sc_emp1', CURRENT_DATE - INTERVAL '14 days', '09:00', 120, 120.00, 'COMPLETED', NULL, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('book_sc_hist_003', 'org_sparkle_clean_123', 'cust_sc_002', 'svc_sc_deep', 'user_sc_emp1', CURRENT_DATE - INTERVAL '30 days', '14:00', 240, 250.00, 'COMPLETED', NULL, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('book_sc_hist_004', 'org_sparkle_clean_123', 'cust_sc_003', 'svc_sc_move', 'user_sc_emp1', CURRENT_DATE - INTERVAL '20 days', '08:00', 300, 350.00, 'COMPLETED', 'Move out clean', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  
  -- QuickFix bookings
  ('book_qf_001', 'org_quickfix_456', 'cust_qf_001', 'svc_qf_emergency', 'user_qf_emp1', CURRENT_DATE, '08:00', 60, 150.00, 'IN_PROGRESS', 'Kitchen sink leak', NOW() - INTERVAL '1 hour', NOW()),
  ('book_qf_002', 'org_quickfix_456', 'cust_qf_002', 'svc_qf_drain', 'user_qf_emp1', CURRENT_DATE + INTERVAL '1 day', '10:00', 90, 125.00, 'CONFIRMED', 'Bathroom drain slow', NOW() - INTERVAL '2 days', NOW()),
  ('book_qf_hist_001', 'org_quickfix_456', 'cust_qf_003', 'svc_qf_repair', 'user_qf_emp1', CURRENT_DATE - INTERVAL '10 days', '14:00', 120, 175.00, 'COMPLETED', 'Fixed leaky faucet', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  
  -- Bright Dental bookings
  ('book_bd_001', 'org_bright_dental_789', 'cust_bd_001', 'svc_bd_cleaning', 'user_bd_owner', CURRENT_DATE + INTERVAL '3 days', '09:00', 60, 150.00, 'CONFIRMED', '6-month checkup', NOW() - INTERVAL '3 days', NOW()),
  ('book_bd_002', 'org_bright_dental_789', 'cust_bd_002', 'svc_bd_exam', 'user_bd_owner', CURRENT_DATE + INTERVAL '5 days', '14:00', 45, 100.00, 'CONFIRMED', 'New patient', NOW() - INTERVAL '1 day', NOW());

-- Create Revenue records (from completed bookings)
INSERT INTO "Revenue" (id, "organizationId", "bookingId", amount, date, type, "createdAt", "updatedAt")
SELECT 
  'rev_' || b.id,
  b."organizationId",
  b.id,
  b.price,
  b."scheduledDate",
  'SERVICE',
  b."createdAt",
  b."updatedAt"
FROM "Booking" b
WHERE b.status = 'COMPLETED';

-- Create Expense Categories
INSERT INTO "ExpenseCategory" (id, "organizationId", name, description, "isActive", "createdAt", "updatedAt")
VALUES
  ('cat_sc_supplies', 'org_sparkle_clean_123', 'Cleaning Supplies', 'All cleaning products and materials', true, NOW() - INTERVAL '3 months', NOW()),
  ('cat_sc_transport', 'org_sparkle_clean_123', 'Transportation', 'Vehicle expenses and fuel', true, NOW() - INTERVAL '3 months', NOW()),
  ('cat_sc_marketing', 'org_sparkle_clean_123', 'Marketing', 'Advertising and promotion', true, NOW() - INTERVAL '3 months', NOW()),
  ('cat_qf_tools', 'org_quickfix_456', 'Tools & Equipment', 'Plumbing tools and equipment', true, NOW() - INTERVAL '2 months', NOW()),
  ('cat_qf_parts', 'org_quickfix_456', 'Parts & Materials', 'Plumbing parts inventory', true, NOW() - INTERVAL '2 months', NOW());

-- Create Expenses
INSERT INTO "Expense" (
  id, "organizationId", "categoryId", description, amount, date, vendor, 
  "isRecurring", "recurringFrequency", source, tags, "createdAt", "updatedAt"
)
VALUES
  -- Sparkle Clean Expenses
  ('exp_sc_001', 'org_sparkle_clean_123', 'cat_sc_supplies', 'Monthly supply order', 450.00, CURRENT_DATE - INTERVAL '5 days', 'CleanPro Supplies', false, NULL, 'MANUAL', ARRAY['supplies']::text[], NOW() - INTERVAL '5 days', NOW()),
  ('exp_sc_002', 'org_sparkle_clean_123', 'cat_sc_transport', 'Gas for vehicles', 125.50, CURRENT_DATE - INTERVAL '3 days', 'Shell Station', false, NULL, 'MANUAL', ARRAY['fuel']::text[], NOW() - INTERVAL '3 days', NOW()),
  ('exp_sc_003', 'org_sparkle_clean_123', 'cat_sc_marketing', 'Google Ads', 300.00, CURRENT_DATE - INTERVAL '1 day', 'Google', true, 'MONTHLY', 'MANUAL', ARRAY['advertising']::text[], NOW() - INTERVAL '1 day', NOW()),
  -- QuickFix Expenses
  ('exp_qf_001', 'org_quickfix_456', 'cat_qf_tools', 'New pipe wrench set', 189.99, CURRENT_DATE - INTERVAL '7 days', 'Home Depot', false, NULL, 'MANUAL', ARRAY['tools']::text[], NOW() - INTERVAL '7 days', NOW()),
  ('exp_qf_002', 'org_quickfix_456', 'cat_qf_parts', 'Pipe fittings inventory', 325.00, CURRENT_DATE - INTERVAL '4 days', 'Ferguson Plumbing', false, NULL, 'MANUAL', ARRAY['inventory']::text[], NOW() - INTERVAL '4 days', NOW());

-- Create Budgets
INSERT INTO "Budget" (id, "organizationId", "categoryId", "monthYear", amount, spent, "createdAt", "updatedAt")
VALUES
  ('budget_sc_001', 'org_sparkle_clean_123', 'cat_sc_supplies', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 500.00, 450.00, NOW(), NOW()),
  ('budget_sc_002', 'org_sparkle_clean_123', 'cat_sc_transport', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 200.00, 125.50, NOW(), NOW()),
  ('budget_sc_003', 'org_sparkle_clean_123', 'cat_sc_marketing', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 400.00, 300.00, NOW(), NOW());

-- Create Marketing Campaigns
INSERT INTO "MarketingCampaign" (
  id, "organizationId", name, type, status, "startDate", "endDate", 
  budget, spent, "targetAudience", content, metrics, "createdAt", "updatedAt"
)
VALUES
  (
    'camp_sc_001', 
    'org_sparkle_clean_123', 
    'Spring Cleaning Special', 
    'EMAIL', 
    'ACTIVE', 
    CURRENT_DATE - INTERVAL '7 days', 
    CURRENT_DATE + INTERVAL '7 days', 
    500.00, 
    125.00,
    '{"segments": ["existing_customers"], "tags": ["regular", "vip"]}'::jsonb,
    '{"subject": "20% Off Spring Deep Cleaning!", "body": "Book your spring deep clean and save..."}'::jsonb,
    '{"sent": 250, "opened": 125, "clicked": 45, "converted": 12}'::jsonb,
    NOW() - INTERVAL '7 days', 
    NOW()
  ),
  (
    'camp_qf_001', 
    'org_quickfix_456', 
    'Emergency Service Promo', 
    'SMS', 
    'ACTIVE', 
    CURRENT_DATE - INTERVAL '3 days', 
    CURRENT_DATE + INTERVAL '10 days', 
    200.00, 
    50.00,
    '{"segments": ["all_customers"]}'::jsonb,
    '{"message": "Save $25 on emergency calls this week! Text SAVE25"}'::jsonb,
    '{"sent": 150, "delivered": 145, "responded": 22}'::jsonb,
    NOW() - INTERVAL '3 days', 
    NOW()
  );

-- Create White Label Settings for Sparkle Clean
INSERT INTO "WhiteLabelSettings" (
  id, "organizationId", "customDomain", "brandName", "logoUrl", 
  "primaryColor", "secondaryColor", "removeBusinessFlowBranding", 
  "createdAt", "updatedAt"
)
VALUES
  (
    'wl_sc_001', 
    'org_sparkle_clean_123', 
    'booking.sparkleclean.com', 
    'Sparkle Clean Booking',
    '/logo-placeholder.png',
    '#2563EB', 
    '#DBEAFE',
    true,
    NOW() - INTERVAL '1 month', 
    NOW()
  );

-- Create AI Chat Sessions and Messages
INSERT INTO "ChatSession" (id, "organizationId", title, "isActive", "createdAt", "updatedAt")
VALUES
  ('chat_sc_001', 'org_sparkle_clean_123', 'Customer service improvements', true, NOW() - INTERVAL '2 days', NOW()),
  ('chat_sc_002', 'org_sparkle_clean_123', 'Marketing strategy ideas', true, NOW() - INTERVAL '1 day', NOW());

INSERT INTO "ChatMessage" (id, "sessionId", role, content, "createdAt")
VALUES
  ('msg_001', 'chat_sc_001', 'user', 'How can I improve my customer retention rate?', NOW() - INTERVAL '2 days'),
  ('msg_002', 'chat_sc_001', 'assistant', 'Here are several strategies to improve customer retention...', NOW() - INTERVAL '2 days'),
  ('msg_003', 'chat_sc_002', 'user', 'What marketing channels work best for cleaning services?', NOW() - INTERVAL '1 day'),
  ('msg_004', 'chat_sc_002', 'assistant', 'For cleaning services, the most effective marketing channels are...', NOW() - INTERVAL '1 day');

-- Summary
SELECT 
  'Demo data created successfully!' as status,
  (SELECT COUNT(*) FROM "Organization") as organizations,
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Service") as services,
  (SELECT COUNT(*) FROM "Customer") as customers,
  (SELECT COUNT(*) FROM "Booking") as bookings,
  (SELECT COUNT(*) FROM "Revenue") as revenue_records,
  (SELECT COUNT(*) FROM "Expense") as expenses,
  (SELECT COUNT(*) FROM "MarketingCampaign") as campaigns;