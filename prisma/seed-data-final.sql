-- BusinessFlow SaaS - Final Seed Data
-- Run this after adding missing columns to populate demo accounts

-- Clean up existing demo data (optional)
DELETE FROM "Revenue" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Booking" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Service" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Customer" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Expense" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "ExpenseCategory" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Budget" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "MarketingCampaign" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "MarketingContact" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "ChatSession" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "WhiteLabelSettings" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Location" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "User" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com');

-- Create Demo Organizations with all required fields
INSERT INTO "Organization" (
  id, name, "businessType", "businessName", email, phone, address, city, state, "zipCode",
  "stripeCustomerId", "stripeSubscriptionId", "stripePriceId", "subscriptionStatus",
  "subscriptionTier", "subscriptionStartDate", "trialEndsAt", "subscriptionEndDate",
  "notificationPreferences", "aiTokensUsed", "createdAt", "updatedAt"
)
VALUES 
  -- Sparkle Clean (Premium - Active)
  (
    'org_sparkle_123', 
    'Sparkle Clean Services', 
    'CLEANING', 
    'Sparkle Clean Services LLC',
    'demo@sparkleclean.com', 
    '(214) 555-0100',
    '123 Clean Street',
    'Dallas',
    'TX',
    '75201',
    'cus_sparkle_demo', 
    'sub_sparkle_demo',
    'price_premium_monthly',
    'active',
    'Premium',
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '3 months' + INTERVAL '14 days',
    NULL, -- No end date for active subscription
    '{"email": true, "sms": true}',
    125, -- AI tokens used
    NOW() - INTERVAL '3 months', 
    NOW()
  ),
  -- QuickFix Plumbing (Growth - Active)
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
    'cus_quickfix_demo',
    'sub_quickfix_demo',
    'price_growth_monthly',
    'active',
    'Growth',
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '2 months' + INTERVAL '14 days',
    NULL,
    '{"email": true, "sms": false}',
    75,
    NOW() - INTERVAL '2 months',
    NOW()
  ),
  -- Bright Dental (Starter - Trial)
  (
    'org_dental_789',
    'Bright Dental Care',
    'DENTAL',
    'Bright Dental Care PC',
    'demo@brightdental.com',
    '(214) 555-0500',
    '555 Dental Plaza',
    'Dallas',
    'TX',
    '75203',
    NULL, -- No Stripe customer yet (trial)
    NULL,
    NULL,
    'trialing',
    'Starter',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '9 days', -- 9 days left in trial
    NOW() + INTERVAL '9 days',
    '{"email": true, "sms": true}',
    10,
    NOW() - INTERVAL '5 days',
    NOW()
  );

-- Create Demo Users (login accounts)
INSERT INTO "User" (id, email, password, "firstName", "lastName", phone, role, "organizationId", "hourlyRate", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Users
  ('user_sc_owner', 'demo@sparkleclean.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Sarah', 'Johnson', '(214) 555-0101', 'admin', 'org_sparkle_123', NULL, NOW() - INTERVAL '3 months', NOW()),
  ('user_sc_tech1', 'mike@sparkleclean.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Mike', 'Davis', '(214) 555-0102', 'technician', 'org_sparkle_123', 25.00, NOW() - INTERVAL '2 months', NOW()),
  ('user_sc_tech2', 'jessica@sparkleclean.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Jessica', 'Lee', '(214) 555-0103', 'technician', 'org_sparkle_123', 22.50, NOW() - INTERVAL '2 months', NOW()),
  
  -- QuickFix Users
  ('user_qf_owner', 'demo@quickfixplumbing.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'John', 'Martinez', '(214) 555-0301', 'admin', 'org_quickfix_456', NULL, NOW() - INTERVAL '2 months', NOW()),
  ('user_qf_tech1', 'bob@quickfixplumbing.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Bob', 'Wilson', '(214) 555-0302', 'technician', 'org_quickfix_456', 35.00, NOW() - INTERVAL '1 month', NOW()),
  
  -- Bright Dental Users
  ('user_bd_owner', 'demo@brightdental.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Dr. Emily', 'Chen', '(214) 555-0501', 'admin', 'org_dental_789', NULL, NOW() - INTERVAL '5 days', NOW()),
  
  -- Customer accounts (no organization)
  ('cust_001', 'customer1@email.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Lisa', 'Thompson', '(214) 555-1001', 'customer', NULL, NULL, NOW() - INTERVAL '3 months', NOW()),
  ('cust_002', 'customer2@email.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Robert', 'Chen', '(469) 555-1002', 'customer', NULL, NULL, NOW() - INTERVAL '2 months', NOW()),
  ('cust_003', 'customer3@email.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Maria', 'Garcia', '(214) 555-1003', 'customer', NULL, NULL, NOW() - INTERVAL '2 months', NOW()),
  ('cust_004', 'customer4@email.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'James', 'Anderson', '(469) 555-1004', 'customer', NULL, NULL, NOW() - INTERVAL '1 month', NOW()),
  ('cust_005', 'customer5@email.com', '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata', 'Amanda', 'Davis', '(214) 555-1005', 'customer', NULL, NULL, NOW() - INTERVAL '1 month', NOW());

-- Create Locations
INSERT INTO "Location" (id, "organizationId", name, address, city, state, "zipCode", "isActive", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Locations
  ('loc_sc_main', 'org_sparkle_123', 'Main Office', '123 Clean Street', 'Dallas', 'TX', '75201', true, NOW() - INTERVAL '3 months', NOW()),
  ('loc_sc_north', 'org_sparkle_123', 'North Dallas', '456 Sparkle Ave', 'Plano', 'TX', '75074', true, NOW() - INTERVAL '2 months', NOW()),
  -- QuickFix Locations
  ('loc_qf_main', 'org_quickfix_456', 'Dallas HQ', '789 Plumbing Way', 'Dallas', 'TX', '75202', true, NOW() - INTERVAL '2 months', NOW()),
  ('loc_qf_east', 'org_quickfix_456', 'East Dallas', '321 Pipe Street', 'Mesquite', 'TX', '75149', true, NOW() - INTERVAL '1 month', NOW()),
  -- Bright Dental Location
  ('loc_bd_main', 'org_dental_789', 'Main Clinic', '555 Dental Plaza', 'Dallas', 'TX', '75203', true, NOW() - INTERVAL '5 days', NOW());

-- Create Services with isActive flag
INSERT INTO "Service" (id, "organizationId", name, description, "basePrice", duration, icon, "isActive", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Services
  ('svc_sc_001', 'org_sparkle_123', 'Basic House Cleaning', '2 bed, 2 bath standard clean', 120.00, 120, '🏠', true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_002', 'org_sparkle_123', 'Deep Clean', 'Comprehensive deep cleaning service', 250.00, 240, '✨', true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_003', 'org_sparkle_123', 'Move In/Out Clean', 'Complete cleaning for moving', 350.00, 300, '📦', true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_004', 'org_sparkle_123', 'Office Cleaning', 'Commercial office cleaning', 200.00, 180, '🏢', true, NOW() - INTERVAL '2 months', NOW()),
  
  -- QuickFix Services
  ('svc_qf_001', 'org_quickfix_456', 'Emergency Service', '24/7 emergency plumbing', 150.00, 60, '🚨', true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_002', 'org_quickfix_456', 'Drain Cleaning', 'Professional drain cleaning', 125.00, 90, '🚿', true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_003', 'org_quickfix_456', 'Pipe Repair', 'Standard pipe repairs', 175.00, 120, '🔧', true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_004', 'org_quickfix_456', 'Water Heater Service', 'Repair or replace water heater', 225.00, 180, '♨️', true, NOW() - INTERVAL '1 month', NOW()),
  
  -- Bright Dental Services
  ('svc_bd_001', 'org_dental_789', 'Teeth Cleaning', 'Regular dental cleaning', 150.00, 60, '🦷', true, NOW() - INTERVAL '5 days', NOW()),
  ('svc_bd_002', 'org_dental_789', 'Dental Exam', 'Comprehensive examination', 100.00, 45, '🔍', true, NOW() - INTERVAL '5 days', NOW()),
  ('svc_bd_003', 'org_dental_789', 'Filling', 'Cavity filling procedure', 250.00, 90, '🩹', true, NOW() - INTERVAL '5 days', NOW());

-- Create Customer records (separate from User table for CRM)
INSERT INTO "Customer" (id, "organizationId", name, email, phone, address, "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Customers
  ('cust_sc_001', 'org_sparkle_123', 'Lisa Thompson', 'customer1@email.com', '(214) 555-1001', '100 Main St, Dallas, TX 75201', NOW() - INTERVAL '3 months', NOW()),
  ('cust_sc_002', 'org_sparkle_123', 'Robert Chen', 'customer2@email.com', '(469) 555-1002', '200 Oak Ave, Plano, TX 75074', NOW() - INTERVAL '2 months', NOW()),
  ('cust_sc_003', 'org_sparkle_123', 'Maria Garcia', 'customer3@email.com', '(214) 555-1003', '300 Elm St, Dallas, TX 75202', NOW() - INTERVAL '2 months', NOW()),
  ('cust_sc_004', 'org_sparkle_123', 'Business - ABC Corp', 'office@abccorp.com', '(214) 555-2000', '500 Commerce St, Dallas, TX 75202', NOW() - INTERVAL '1 month', NOW()),
  
  -- QuickFix Customers
  ('cust_qf_001', 'org_quickfix_456', 'James Anderson', 'customer4@email.com', '(469) 555-1004', '400 Pine Rd, Dallas, TX 75205', NOW() - INTERVAL '2 months', NOW()),
  ('cust_qf_002', 'org_quickfix_456', 'Amanda Davis', 'customer5@email.com', '(214) 555-1005', '500 Cedar Ln, Dallas, TX 75203', NOW() - INTERVAL '1 month', NOW()),
  ('cust_qf_003', 'org_quickfix_456', 'Restaurant - Joe''s Kitchen', 'manager@joeskitchen.com', '(214) 555-3000', '800 Food St, Dallas, TX 75207', NOW() - INTERVAL '1 month', NOW()),
  
  -- Bright Dental Customers
  ('cust_bd_001', 'org_dental_789', 'Family - The Johnsons', 'johnson.family@email.com', '(214) 555-4001', '900 Smile St, Dallas, TX 75208', NOW() - INTERVAL '5 days', NOW()),
  ('cust_bd_002', 'org_dental_789', 'Senior - Betty White', 'betty.white@email.com', '(214) 555-4002', '1000 Golden Ave, Dallas, TX 75209', NOW() - INTERVAL '3 days', NOW());

-- Create Bookings with all required fields
INSERT INTO "Booking" (
  id, "customerId", "technicianId", "serviceId", "organizationId", "userId", "locationId",
  frequency, date, time, "scheduledDate", "scheduledTime", duration, status,
  address, city, state, "zipCode",
  "basePrice", discount, "finalPrice",
  "specialInstructions", rating, review,
  "confirmationSentAt", "reminderSentAt",
  "createdAt", "updatedAt"
)
VALUES
  -- Today's bookings for Sparkle Clean
  ('book_sc_001', 'cust_001', 'user_sc_tech1', 'svc_sc_001', 'org_sparkle_123', 'user_sc_owner', 'loc_sc_main',
   'weekly', CURRENT_DATE, '09:00', CURRENT_DATE, '09:00', '120', 'scheduled',
   '100 Main St', 'Dallas', 'TX', '75201',
   120.00, 0, 120.00,
   'Gate code: 1234', NULL, NULL,
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '2 days', NOW()),
   
  ('book_sc_002', 'cust_002', 'user_sc_tech2', 'svc_sc_002', 'org_sparkle_123', 'user_sc_owner', 'loc_sc_north',
   'monthly', CURRENT_DATE, '14:00', CURRENT_DATE, '14:00', '240', 'scheduled',
   '200 Oak Ave', 'Plano', 'TX', '75074',
   250.00, 25.00, 225.00,
   'Pet friendly - have 2 dogs', NULL, NULL,
   NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 week', NOW()),
   
  -- Upcoming bookings
  ('book_sc_003', 'cust_003', 'user_sc_tech1', 'svc_sc_001', 'org_sparkle_123', 'user_sc_owner', 'loc_sc_main',
   'biweekly', CURRENT_DATE + INTERVAL '1 day', '10:00', CURRENT_DATE + INTERVAL '1 day', '10:00', '120', 'scheduled',
   '300 Elm St', 'Dallas', 'TX', '75202',
   120.00, 0, 120.00,
   NULL, NULL, NULL,
   NOW() - INTERVAL '3 days', NULL,
   NOW() - INTERVAL '3 days', NOW()),
   
  -- Past completed bookings (for revenue)
  ('book_sc_past_001', 'cust_001', 'user_sc_tech1', 'svc_sc_001', 'org_sparkle_123', 'user_sc_owner', 'loc_sc_main',
   'weekly', CURRENT_DATE - INTERVAL '7 days', '09:00', CURRENT_DATE - INTERVAL '7 days', '09:00', '120', 'completed',
   '100 Main St', 'Dallas', 'TX', '75201',
   120.00, 0, 120.00,
   NULL, 5, 'Excellent service as always!',
   NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days',
   NOW() - INTERVAL '9 days', NOW() - INTERVAL '7 days'),
   
  ('book_sc_past_002', 'cust_004', 'user_sc_tech2', 'svc_sc_004', 'org_sparkle_123', 'user_sc_owner', 'loc_sc_main',
   'weekly', CURRENT_DATE - INTERVAL '3 days', '18:00', CURRENT_DATE - INTERVAL '3 days', '18:00', '180', 'completed',
   '500 Commerce St', 'Dallas', 'TX', '75202',
   200.00, 0, 200.00,
   'After hours cleaning', 5, 'Office looks great!',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
   
  -- QuickFix bookings
  ('book_qf_001', 'cust_004', 'user_qf_tech1', 'svc_qf_001', 'org_quickfix_456', 'user_qf_owner', 'loc_qf_main',
   'once', CURRENT_DATE, '08:00', CURRENT_DATE, '08:00', '60', 'in_progress',
   '400 Pine Rd', 'Dallas', 'TX', '75205',
   150.00, 0, 150.00,
   'Kitchen sink leak - urgent!', NULL, NULL,
   NOW() - INTERVAL '1 hour', NULL,
   NOW() - INTERVAL '2 hours', NOW()),
   
  ('book_qf_002', 'cust_005', 'user_qf_tech1', 'svc_qf_002', 'org_quickfix_456', 'user_qf_owner', 'loc_qf_main',
   'once', CURRENT_DATE + INTERVAL '2 days', '10:00', CURRENT_DATE + INTERVAL '2 days', '10:00', '90', 'scheduled',
   '500 Cedar Ln', 'Dallas', 'TX', '75203',
   125.00, 0, 125.00,
   'Bathroom drain very slow', NULL, NULL,
   NOW() - INTERVAL '1 day', NULL,
   NOW() - INTERVAL '1 day', NOW()),
   
  -- Bright Dental bookings
  ('book_bd_001', 'cust_001', 'user_bd_owner', 'svc_bd_001', 'org_dental_789', 'user_bd_owner', 'loc_bd_main',
   'once', CURRENT_DATE + INTERVAL '3 days', '09:00', CURRENT_DATE + INTERVAL '3 days', '09:00', '60', 'scheduled',
   '900 Smile St', 'Dallas', 'TX', '75208',
   150.00, 0, 150.00,
   '6-month checkup for whole family', NULL, NULL,
   NOW() - INTERVAL '3 days', NULL,
   NOW() - INTERVAL '3 days', NOW());

-- Create Revenue records from completed bookings
INSERT INTO "Revenue" (id, "organizationId", "bookingId", amount, date, type, month, year, "createdAt", "updatedAt")
VALUES
  ('rev_001', 'org_sparkle_123', 'book_sc_past_001', 120.00, CURRENT_DATE - INTERVAL '7 days', 'SERVICE', TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'MM'), EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '7 days'), NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('rev_002', 'org_sparkle_123', 'book_sc_past_002', 200.00, CURRENT_DATE - INTERVAL '3 days', 'SERVICE', TO_CHAR(CURRENT_DATE - INTERVAL '3 days', 'MM'), EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '3 days'), NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Add more historical revenue for charts
INSERT INTO "Revenue" (id, "organizationId", "bookingId", amount, date, type, month, year, "createdAt", "updatedAt")
SELECT 
  'rev_hist_' || generate_series,
  'org_sparkle_123',
  NULL,
  CASE (generate_series % 3)
    WHEN 0 THEN 120.00
    WHEN 1 THEN 200.00
    ELSE 250.00
  END,
  CURRENT_DATE - (generate_series || ' days')::INTERVAL,
  'SERVICE',
  TO_CHAR(CURRENT_DATE - (generate_series || ' days')::INTERVAL, 'MM'),
  EXTRACT(YEAR FROM CURRENT_DATE - (generate_series || ' days')::INTERVAL),
  NOW() - (generate_series || ' days')::INTERVAL,
  NOW() - (generate_series || ' days')::INTERVAL
FROM generate_series(10, 90, 7);

-- Create Expense Categories
INSERT INTO "ExpenseCategory" (id, "organizationId", name, description, color, icon, "isDefault", "createdAt", "updatedAt")
VALUES
  ('cat_sc_001', 'org_sparkle_123', 'Supplies', 'Cleaning supplies and materials', '#3B82F6', '🧹', true, NOW() - INTERVAL '3 months', NOW()),
  ('cat_sc_002', 'org_sparkle_123', 'Transportation', 'Vehicle and fuel expenses', '#10B981', '🚗', true, NOW() - INTERVAL '3 months', NOW()),
  ('cat_sc_003', 'org_sparkle_123', 'Marketing', 'Advertising and promotion', '#8B5CF6', '📢', true, NOW() - INTERVAL '3 months', NOW()),
  ('cat_sc_004', 'org_sparkle_123', 'Payroll', 'Employee wages and benefits', '#EF4444', '💰', true, NOW() - INTERVAL '3 months', NOW()),
  
  ('cat_qf_001', 'org_quickfix_456', 'Tools', 'Tools and equipment', '#F59E0B', '🔧', true, NOW() - INTERVAL '2 months', NOW()),
  ('cat_qf_002', 'org_quickfix_456', 'Parts', 'Plumbing parts and materials', '#6366F1', '🔩', true, NOW() - INTERVAL '2 months', NOW());

-- Create Expenses
INSERT INTO "Expense" (
  id, "organizationId", "categoryId", description, amount, date, vendor,
  "isRecurring", "recurringFrequency", source, tags, "createdAt", "updatedAt"
)
VALUES
  -- Sparkle Clean Expenses
  ('exp_sc_001', 'org_sparkle_123', 'cat_sc_001', 'Monthly supply order', 450.00, CURRENT_DATE - INTERVAL '5 days', 'CleanPro Supplies', false, NULL, 'MANUAL', ARRAY['supplies', 'monthly']::text[], NOW() - INTERVAL '5 days', NOW()),
  ('exp_sc_002', 'org_sparkle_123', 'cat_sc_002', 'Gas for week', 125.50, CURRENT_DATE - INTERVAL '3 days', 'Shell Station', false, NULL, 'MANUAL', ARRAY['fuel']::text[], NOW() - INTERVAL '3 days', NOW()),
  ('exp_sc_003', 'org_sparkle_123', 'cat_sc_003', 'Google Ads', 300.00, CURRENT_DATE - INTERVAL '1 day', 'Google', true, 'MONTHLY', 'GOOGLE_ADS', ARRAY['advertising', 'digital']::text[], NOW() - INTERVAL '30 days', NOW()),
  ('exp_sc_004', 'org_sparkle_123', 'cat_sc_004', 'Biweekly payroll', 3200.00, CURRENT_DATE - INTERVAL '7 days', 'Payroll', true, 'BIWEEKLY', 'PAYROLL', ARRAY['wages']::text[], NOW() - INTERVAL '7 days', NOW()),
  
  -- QuickFix Expenses
  ('exp_qf_001', 'org_quickfix_456', 'cat_qf_001', 'New pipe wrench set', 189.99, CURRENT_DATE - INTERVAL '7 days', 'Home Depot', false, NULL, 'MANUAL', ARRAY['tools']::text[], NOW() - INTERVAL '7 days', NOW()),
  ('exp_qf_002', 'org_quickfix_456', 'cat_qf_002', 'Pipe fittings inventory', 325.00, CURRENT_DATE - INTERVAL '4 days', 'Ferguson Plumbing', false, NULL, 'MANUAL', ARRAY['inventory']::text[], NOW() - INTERVAL '4 days', NOW());

-- Create Budgets
INSERT INTO "Budget" (id, "organizationId", "categoryId", "monthYear", amount, spent, "createdAt", "updatedAt")
VALUES
  ('budget_sc_001', 'org_sparkle_123', 'cat_sc_001', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 500.00, 450.00, NOW(), NOW()),
  ('budget_sc_002', 'org_sparkle_123', 'cat_sc_002', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 200.00, 125.50, NOW(), NOW()),
  ('budget_sc_003', 'org_sparkle_123', 'cat_sc_003', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 400.00, 300.00, NOW(), NOW()),
  ('budget_sc_004', 'org_sparkle_123', 'cat_sc_004', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 6500.00, 3200.00, NOW(), NOW());

-- Create Marketing Campaigns
INSERT INTO "MarketingCampaign" (
  id, "organizationId", name, type, status, "startDate", "endDate",
  budget, spent, "targetAudience", content, metrics, "createdAt", "updatedAt"
)
VALUES
  (
    'camp_sc_001', 
    'org_sparkle_123', 
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

-- Create Marketing Contacts
INSERT INTO "MarketingContact" (
  id, "organizationId", email, "firstName", "lastName", phone, tags, status,
  "lastEngagement", metadata, "createdAt", "updatedAt"
)
VALUES
  ('mc_sc_001', 'org_sparkle_123', 'customer1@email.com', 'Lisa', 'Thompson', '(214) 555-1001', ARRAY['vip', 'weekly']::text[], 'ACTIVE', NOW() - INTERVAL '2 days', '{"source": "website", "lifetime_value": 2400}'::jsonb, NOW() - INTERVAL '3 months', NOW()),
  ('mc_sc_002', 'org_sparkle_123', 'customer2@email.com', 'Robert', 'Chen', '(469) 555-1002', ARRAY['monthly']::text[], 'ACTIVE', NOW() - INTERVAL '7 days', '{"source": "referral", "lifetime_value": 1500}'::jsonb, NOW() - INTERVAL '2 months', NOW()),
  ('mc_qf_001', 'org_quickfix_456', 'customer4@email.com', 'James', 'Anderson', '(469) 555-1004', ARRAY['emergency']::text[], 'ACTIVE', NOW() - INTERVAL '1 day', '{"source": "google", "lifetime_value": 750}'::jsonb, NOW() - INTERVAL '2 months', NOW());

-- Create White Label Settings for Sparkle Clean
INSERT INTO "WhiteLabelSettings" (
  id, "organizationId", "customDomain", "brandName", "logoUrl",
  "primaryColor", "secondaryColor", "removeBusinessFlowBranding",
  "createdAt", "updatedAt"
)
VALUES
  (
    'wl_sc_001', 
    'org_sparkle_123', 
    'booking.sparkleclean.com', 
    'Sparkle Clean Booking',
    '/images/sparkle-logo.png',
    '#2563EB', 
    '#DBEAFE',
    true,
    NOW() - INTERVAL '1 month', 
    NOW()
  );

-- Create AI Chat Sessions
INSERT INTO "ChatSession" (id, "organizationId", title, "isActive", "createdAt", "updatedAt")
VALUES
  ('chat_sc_001', 'org_sparkle_123', 'Customer retention strategies', true, NOW() - INTERVAL '2 days', NOW()),
  ('chat_sc_002', 'org_sparkle_123', 'Marketing ideas for summer', true, NOW() - INTERVAL '1 day', NOW()),
  ('chat_qf_001', 'org_quickfix_456', 'Emergency service pricing', true, NOW() - INTERVAL '3 days', NOW());

-- Create Chat Messages
INSERT INTO "ChatMessage" (id, "sessionId", role, content, context, "createdAt")
VALUES
  ('msg_001', 'chat_sc_001', 'user', 'How can I improve customer retention for my cleaning business?', NULL, NOW() - INTERVAL '2 days'),
  ('msg_002', 'chat_sc_001', 'assistant', 'Here are several strategies to improve customer retention for your cleaning business: 1) Implement a loyalty program...', '{"tokens_used": 150}'::jsonb, NOW() - INTERVAL '2 days'),
  ('msg_003', 'chat_sc_002', 'user', 'What are effective summer marketing campaigns for cleaning services?', NULL, NOW() - INTERVAL '1 day'),
  ('msg_004', 'chat_sc_002', 'assistant', 'Summer is a great time for cleaning services. Here are campaign ideas: 1) "Summer Fresh" deep cleaning special...', '{"tokens_used": 200}'::jsonb, NOW() - INTERVAL '1 day');

-- Summary
SELECT 
  'Demo data created successfully!' as status,
  (SELECT COUNT(*) FROM "Organization" WHERE email LIKE 'demo@%') as demo_organizations,
  (SELECT COUNT(*) FROM "User") as total_users,
  (SELECT COUNT(*) FROM "Service") as services,
  (SELECT COUNT(*) FROM "Customer") as customers,
  (SELECT COUNT(*) FROM "Booking") as bookings,
  (SELECT COUNT(*) FROM "Revenue") as revenue_records,
  (SELECT COUNT(*) FROM "Expense") as expenses,
  (SELECT COUNT(*) FROM "MarketingCampaign") as campaigns,
  (SELECT COUNT(*) FROM "ChatSession") as chat_sessions;