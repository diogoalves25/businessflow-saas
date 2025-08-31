-- BusinessFlow Demo Data SQL
-- Run this in Supabase SQL Editor to populate demo accounts

-- Clean up existing demo data (optional - remove if you want to keep existing data)
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
DELETE FROM "MarketingCampaign" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Location" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "WhiteLabelSettings" WHERE "organizationId" IN (
  SELECT id FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com')
);
DELETE FROM "Organization" WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com');

-- Create Demo Organizations
INSERT INTO "Organization" (id, name, email, password, "businessType", "subscriptionTier", "subscriptionStartDate", "stripeCustomerId", "createdAt", "updatedAt")
VALUES 
  -- Sparkle Clean (Premium)
  ('org_sparkle_clean_123', 'Sparkle Clean Services', 'demo@sparkleclean.com', '$2a$10$YourHashedPasswordHere', 'CLEANING', 'PREMIUM', NOW() - INTERVAL '3 months', 'cus_sparkle_demo_123', NOW() - INTERVAL '3 months', NOW()),
  -- QuickFix Plumbing (Growth)
  ('org_quickfix_456', 'QuickFix Plumbing', 'demo@quickfixplumbing.com', '$2a$10$YourHashedPasswordHere', 'PLUMBING', 'GROWTH', NOW() - INTERVAL '2 months', 'cus_quickfix_demo_456', NOW() - INTERVAL '2 months', NOW()),
  -- Bright Dental (Starter)
  ('org_bright_dental_789', 'Bright Dental Care', 'demo@brightdental.com', '$2a$10$YourHashedPasswordHere', 'OTHER', 'STARTER', NOW() - INTERVAL '1 month', 'cus_dental_demo_789', NOW() - INTERVAL '1 month', NOW());

-- Create Locations
INSERT INTO "Location" (id, "organizationId", name, address, city, state, "zipCode", phone, "isActive", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Locations
  ('loc_sc_main', 'org_sparkle_clean_123', 'Main Office', '123 Clean Street', 'Dallas', 'TX', '75201', '(214) 555-0100', true, NOW() - INTERVAL '3 months', NOW()),
  ('loc_sc_north', 'org_sparkle_clean_123', 'North Dallas', '456 Sparkle Ave', 'Plano', 'TX', '75074', '(469) 555-0200', true, NOW() - INTERVAL '2 months', NOW()),
  -- QuickFix Locations
  ('loc_qf_dallas', 'org_quickfix_456', 'Dallas Branch', '789 Plumbing Way', 'Dallas', 'TX', '75202', '(214) 555-0300', true, NOW() - INTERVAL '2 months', NOW()),
  ('loc_qf_plano', 'org_quickfix_456', 'Plano Branch', '321 Pipe Street', 'Plano', 'TX', '75075', '(469) 555-0400', true, NOW() - INTERVAL '1 month', NOW()),
  -- Bright Dental Location
  ('loc_bd_main', 'org_bright_dental_789', 'Main Clinic', '555 Dental Plaza', 'Dallas', 'TX', '75203', '(214) 555-0500', true, NOW() - INTERVAL '1 month', NOW());

-- Create Services
INSERT INTO "Service" (id, "organizationId", name, description, duration, price, "isActive", "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Services
  ('svc_sc_basic', 'org_sparkle_clean_123', 'Basic House Cleaning', '2 bed, 2 bath standard clean', 120, 120.00, true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_deep', 'org_sparkle_clean_123', 'Deep Clean', 'Comprehensive deep cleaning service', 240, 250.00, true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_move', 'org_sparkle_clean_123', 'Move In/Out Clean', 'Complete cleaning for moving', 300, 350.00, true, NOW() - INTERVAL '3 months', NOW()),
  ('svc_sc_office', 'org_sparkle_clean_123', 'Office Cleaning', 'Commercial office cleaning', 180, 200.00, true, NOW() - INTERVAL '3 months', NOW()),
  -- QuickFix Services
  ('svc_qf_emergency', 'org_quickfix_456', 'Emergency Plumbing', '24/7 emergency service call', 60, 150.00, true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_drain', 'org_quickfix_456', 'Drain Cleaning', 'Professional drain cleaning', 90, 125.00, true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_repair', 'org_quickfix_456', 'General Repair', 'Standard plumbing repairs', 120, 175.00, true, NOW() - INTERVAL '2 months', NOW()),
  ('svc_qf_install', 'org_quickfix_456', 'Fixture Installation', 'Install new fixtures', 180, 225.00, true, NOW() - INTERVAL '2 months', NOW()),
  -- Bright Dental Services
  ('svc_bd_cleaning', 'org_bright_dental_789', 'Teeth Cleaning', 'Regular dental cleaning', 60, 150.00, true, NOW() - INTERVAL '1 month', NOW()),
  ('svc_bd_exam', 'org_bright_dental_789', 'Dental Exam', 'Comprehensive dental examination', 45, 100.00, true, NOW() - INTERVAL '1 month', NOW()),
  ('svc_bd_filling', 'org_bright_dental_789', 'Cavity Filling', 'Tooth filling procedure', 90, 250.00, true, NOW() - INTERVAL '1 month', NOW());

-- Create Customers
-- Sparkle Clean Customers (20)
INSERT INTO "Customer" (id, "organizationId", name, email, phone, address, city, state, "zipCode", tags, notes, "createdAt", "updatedAt")
VALUES
  ('cust_sc_001', 'org_sparkle_clean_123', 'Sarah Johnson', 'sarah.johnson@email.com', '(214) 555-1001', '100 Main St', 'Dallas', 'TX', '75201', ARRAY['regular', 'vip']::text[], 'Prefers eco-friendly products', NOW() - INTERVAL '3 months', NOW()),
  ('cust_sc_002', 'org_sparkle_clean_123', 'Michael Chen', 'michael.chen@email.com', '(469) 555-1002', '200 Oak Ave', 'Plano', 'TX', '75074', ARRAY['weekly']::text[], 'Has 2 dogs', NOW() - INTERVAL '3 months', NOW()),
  ('cust_sc_003', 'org_sparkle_clean_123', 'Emily Davis', 'emily.davis@email.com', '(214) 555-1003', '300 Elm St', 'Dallas', 'TX', '75202', ARRAY['biweekly']::text[], 'Office cleaning client', NOW() - INTERVAL '2 months', NOW()),
  ('cust_sc_004', 'org_sparkle_clean_123', 'Robert Wilson', 'robert.wilson@email.com', '(469) 555-1004', '400 Pine Rd', 'Plano', 'TX', '75075', ARRAY['monthly']::text[], NULL, NOW() - INTERVAL '2 months', NOW()),
  ('cust_sc_005', 'org_sparkle_clean_123', 'Lisa Thompson', 'lisa.thompson@email.com', '(214) 555-1005', '500 Cedar Ln', 'Dallas', 'TX', '75203', ARRAY['vip']::text[], 'Requires text reminders', NOW() - INTERVAL '2 months', NOW());

-- QuickFix Customers (15)
INSERT INTO "Customer" (id, "organizationId", name, email, phone, address, city, state, "zipCode", tags, notes, "createdAt", "updatedAt")
VALUES
  ('cust_qf_001', 'org_quickfix_456', 'James Martinez', 'james.martinez@email.com', '(214) 555-2001', '600 Water St', 'Dallas', 'TX', '75204', ARRAY['commercial']::text[], 'Restaurant owner', NOW() - INTERVAL '2 months', NOW()),
  ('cust_qf_002', 'org_quickfix_456', 'Amanda White', 'amanda.white@email.com', '(469) 555-2002', '700 Pipe Ave', 'Plano', 'TX', '75076', ARRAY['residential']::text[], 'Emergency contact available', NOW() - INTERVAL '2 months', NOW()),
  ('cust_qf_003', 'org_quickfix_456', 'David Brown', 'david.brown@email.com', '(214) 555-2003', '800 Drain Rd', 'Dallas', 'TX', '75205', ARRAY['vip', 'commercial']::text[], 'Property manager - 5 buildings', NOW() - INTERVAL '1 month', NOW());

-- Bright Dental Customers (10)
INSERT INTO "Customer" (id, "organizationId", name, email, phone, address, city, state, "zipCode", tags, notes, "createdAt", "updatedAt")
VALUES
  ('cust_bd_001', 'org_bright_dental_789', 'Jennifer Lee', 'jennifer.lee@email.com', '(214) 555-3001', '900 Smile St', 'Dallas', 'TX', '75206', ARRAY['regular']::text[], 'Sensitive teeth', NOW() - INTERVAL '1 month', NOW()),
  ('cust_bd_002', 'org_bright_dental_789', 'Thomas Anderson', 'thomas.anderson@email.com', '(214) 555-3002', '1000 Tooth Ave', 'Dallas', 'TX', '75207', ARRAY['family']::text[], 'Family of 4', NOW() - INTERVAL '1 month', NOW()),
  ('cust_bd_003', 'org_bright_dental_789', 'Maria Garcia', 'maria.garcia@email.com', '(214) 555-3003', '1100 Dental Ln', 'Dallas', 'TX', '75208', ARRAY['senior']::text[], 'Requires wheelchair access', NOW() - INTERVAL '3 weeks', NOW());

-- Create Bookings
-- Sparkle Clean Bookings (Recent and Historical)
INSERT INTO "Booking" (id, "organizationId", "customerId", "serviceId", "locationId", "scheduledDate", "scheduledTime", duration, price, status, notes, "createdAt", "updatedAt")
VALUES
  -- Today's bookings
  ('book_sc_today_001', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'loc_sc_main', CURRENT_DATE, '09:00', 120, 120.00, 'CONFIRMED', 'Regular weekly cleaning', NOW() - INTERVAL '2 days', NOW()),
  ('book_sc_today_002', 'org_sparkle_clean_123', 'cust_sc_002', 'svc_sc_deep', 'loc_sc_main', CURRENT_DATE, '14:00', 240, 250.00, 'CONFIRMED', 'Monthly deep clean', NOW() - INTERVAL '1 week', NOW()),
  
  -- This week
  ('book_sc_week_001', 'org_sparkle_clean_123', 'cust_sc_003', 'svc_sc_office', 'loc_sc_north', CURRENT_DATE + INTERVAL '2 days', '18:00', 180, 200.00, 'CONFIRMED', 'Evening office cleaning', NOW() - INTERVAL '3 days', NOW()),
  ('book_sc_week_002', 'org_sparkle_clean_123', 'cust_sc_004', 'svc_sc_basic', 'loc_sc_main', CURRENT_DATE + INTERVAL '3 days', '10:00', 120, 120.00, 'CONFIRMED', NULL, NOW() - INTERVAL '4 days', NOW()),
  
  -- Historical (for revenue charts)
  ('book_sc_hist_001', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'loc_sc_main', CURRENT_DATE - INTERVAL '7 days', '09:00', 120, 120.00, 'COMPLETED', 'Regular weekly', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('book_sc_hist_002', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'loc_sc_main', CURRENT_DATE - INTERVAL '14 days', '09:00', 120, 120.00, 'COMPLETED', 'Regular weekly', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('book_sc_hist_003', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'loc_sc_main', CURRENT_DATE - INTERVAL '21 days', '09:00', 120, 120.00, 'COMPLETED', 'Regular weekly', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
  ('book_sc_hist_004', 'org_sparkle_clean_123', 'cust_sc_002', 'svc_sc_deep', 'loc_sc_main', CURRENT_DATE - INTERVAL '30 days', '14:00', 240, 250.00, 'COMPLETED', 'Monthly deep', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('book_sc_hist_005', 'org_sparkle_clean_123', 'cust_sc_003', 'svc_sc_office', 'loc_sc_north', CURRENT_DATE - INTERVAL '5 days', '18:00', 180, 200.00, 'COMPLETED', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('book_sc_hist_006', 'org_sparkle_clean_123', 'cust_sc_004', 'svc_sc_move', 'loc_sc_main', CURRENT_DATE - INTERVAL '15 days', '08:00', 300, 350.00, 'COMPLETED', 'Move out cleaning', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- QuickFix Bookings
INSERT INTO "Booking" (id, "organizationId", "customerId", "serviceId", "locationId", "scheduledDate", "scheduledTime", duration, price, status, notes, "createdAt", "updatedAt")
VALUES
  -- Active bookings
  ('book_qf_001', 'org_quickfix_456', 'cust_qf_001', 'svc_qf_emergency', 'loc_qf_dallas', CURRENT_DATE, '08:00', 60, 150.00, 'IN_PROGRESS', 'Leak in kitchen', NOW() - INTERVAL '1 hour', NOW()),
  ('book_qf_002', 'org_quickfix_456', 'cust_qf_002', 'svc_qf_drain', 'loc_qf_plano', CURRENT_DATE + INTERVAL '1 day', '10:00', 90, 125.00, 'CONFIRMED', 'Slow bathroom drain', NOW() - INTERVAL '2 days', NOW()),
  
  -- Historical
  ('book_qf_hist_001', 'org_quickfix_456', 'cust_qf_003', 'svc_qf_repair', 'loc_qf_dallas', CURRENT_DATE - INTERVAL '10 days', '14:00', 120, 175.00, 'COMPLETED', 'Fixed toilet', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('book_qf_hist_002', 'org_quickfix_456', 'cust_qf_001', 'svc_qf_install', 'loc_qf_dallas', CURRENT_DATE - INTERVAL '20 days', '09:00', 180, 225.00, 'COMPLETED', 'New faucet install', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

-- Bright Dental Bookings
INSERT INTO "Booking" (id, "organizationId", "customerId", "serviceId", "locationId", "scheduledDate", "scheduledTime", duration, price, status, notes, "createdAt", "updatedAt")
VALUES
  ('book_bd_001', 'org_bright_dental_789', 'cust_bd_001', 'svc_bd_cleaning', 'loc_bd_main', CURRENT_DATE + INTERVAL '1 day', '09:00', 60, 150.00, 'CONFIRMED', '6-month checkup', NOW() - INTERVAL '3 days', NOW()),
  ('book_bd_002', 'org_bright_dental_789', 'cust_bd_002', 'svc_bd_exam', 'loc_bd_main', CURRENT_DATE + INTERVAL '3 days', '14:00', 45, 100.00, 'CONFIRMED', 'New patient exam', NOW() - INTERVAL '1 week', NOW()),
  ('book_bd_003', 'org_bright_dental_789', 'cust_bd_003', 'svc_bd_filling', 'loc_bd_main', CURRENT_DATE + INTERVAL '5 days', '10:30', 90, 250.00, 'CONFIRMED', 'Upper molar', NOW() - INTERVAL '2 days', NOW());

-- Create Expenses (Premium feature for Sparkle Clean)
INSERT INTO "Expense" (id, "organizationId", "categoryId", description, amount, date, vendor, "receiptUrl", "isRecurring", "recurringFrequency", source, "sourceId", tags, "createdAt", "updatedAt")
VALUES
  -- Manual expenses
  ('exp_sc_001', 'org_sparkle_clean_123', NULL, 'Cleaning Supplies - Bulk Order', 450.00, CURRENT_DATE - INTERVAL '5 days', 'CleanPro Supplies', NULL, false, NULL, 'MANUAL', NULL, ARRAY['supplies', 'inventory']::text[], NOW() - INTERVAL '5 days', NOW()),
  ('exp_sc_002', 'org_sparkle_clean_123', NULL, 'Vehicle Gas', 125.50, CURRENT_DATE - INTERVAL '3 days', 'Shell Station', NULL, false, NULL, 'MANUAL', NULL, ARRAY['transportation']::text[], NOW() - INTERVAL '3 days', NOW()),
  ('exp_sc_003', 'org_sparkle_clean_123', NULL, 'Insurance Payment', 350.00, CURRENT_DATE - INTERVAL '10 days', 'State Farm', NULL, true, 'MONTHLY', 'MANUAL', NULL, ARRAY['insurance']::text[], NOW() - INTERVAL '10 days', NOW()),
  
  -- Automated expenses from integrations
  ('exp_sc_004', 'org_sparkle_clean_123', NULL, 'Google Ads Campaign', 285.75, CURRENT_DATE - INTERVAL '1 day', 'Google Ads', NULL, false, NULL, 'GOOGLE_ADS', 'campaign_123', ARRAY['marketing', 'ads']::text[], NOW() - INTERVAL '1 day', NOW()),
  ('exp_sc_005', 'org_sparkle_clean_123', NULL, 'Employee Payroll', 3200.00, CURRENT_DATE - INTERVAL '7 days', 'Payroll System', NULL, true, 'BIWEEKLY', 'PAYROLL', 'payroll_batch_456', ARRAY['payroll', 'labor']::text[], NOW() - INTERVAL '7 days', NOW()),
  ('exp_sc_006', 'org_sparkle_clean_123', NULL, 'SMS Marketing Credits', 50.00, CURRENT_DATE - INTERVAL '2 days', 'Twilio', NULL, false, NULL, 'TWILIO', 'sms_batch_789', ARRAY['marketing', 'sms']::text[], NOW() - INTERVAL '2 days', NOW());

-- Create Marketing Campaigns (Growth & Premium feature)
INSERT INTO "MarketingCampaign" (id, "organizationId", name, type, status, "startDate", "endDate", budget, spent, "targetAudience", content, metrics, "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Campaigns
  ('camp_sc_001', 'org_sparkle_clean_123', 'Spring Cleaning Special', 'EMAIL', 'ACTIVE', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 500.00, 125.00, 
   '{"segments": ["existing_customers"], "tags": ["regular", "vip"]}',
   '{"subject": "20% Off Spring Deep Cleaning!", "body": "Book your spring deep clean and save..."}',
   '{"sent": 250, "opened": 125, "clicked": 45, "converted": 12}',
   NOW() - INTERVAL '7 days', NOW()),
   
  ('camp_sc_002', 'org_sparkle_clean_123', 'New Customer Promo', 'SMS', 'COMPLETED', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', 200.00, 180.00,
   '{"segments": ["new_leads"], "location": "Dallas"}',
   '{"message": "Get $30 off your first cleaning! Use code NEW30"}',
   '{"sent": 100, "delivered": 95, "responded": 20, "converted": 8}',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'),
   
  -- QuickFix Campaign
  ('camp_qf_001', 'org_quickfix_456', 'Winter Prep Reminder', 'SMS', 'ACTIVE', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '14 days', 150.00, 50.00,
   '{"segments": ["all_customers"]}',
   '{"message": "Winter is coming! Schedule your pipe inspection today"}',
   '{"sent": 75, "delivered": 72, "responded": 15}',
   NOW() - INTERVAL '3 days', NOW());

-- Create White Label Settings (Premium feature for Sparkle Clean)
INSERT INTO "WhiteLabelSettings" (id, "organizationId", "customDomain", "brandName", "logoUrl", "faviconUrl", "primaryColor", "secondaryColor", "customCSS", "emailFromName", "emailFromAddress", "removeBusinessFlowBranding", "createdAt", "updatedAt")
VALUES
  ('wl_sc_001', 'org_sparkle_clean_123', 'booking.sparkleclean.com', 'Sparkle Clean Booking', 
   'https://businessflow-uploads.s3.amazonaws.com/sparkle-logo.png',
   'https://businessflow-uploads.s3.amazonaws.com/sparkle-favicon.ico',
   '#2563EB', '#DBEAFE',
   '.btn-primary { border-radius: 20px; } .header { background: linear-gradient(to right, #2563EB, #60A5FA); }',
   'Sparkle Clean', 'booking@sparkleclean.com', true,
   NOW() - INTERVAL '1 month', NOW());

-- Update Organization passwords with bcrypt hash for "demo123"
UPDATE "Organization" 
SET password = '$2a$10$eBxIHDAphfbXPa3I1VQxBuqhxeNKFvO0WYAwENP4O3B0xH5kOpata'
WHERE email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com');

-- Create sample reviews/ratings for businesses
INSERT INTO "Booking" (id, "organizationId", "customerId", "serviceId", "locationId", "scheduledDate", "scheduledTime", duration, price, status, notes, rating, review, "createdAt", "updatedAt")
VALUES
  -- Sparkle Clean Reviews
  ('book_sc_review_001', 'org_sparkle_clean_123', 'cust_sc_001', 'svc_sc_basic', 'loc_sc_main', CURRENT_DATE - INTERVAL '30 days', '09:00', 120, 120.00, 'COMPLETED', NULL, 5, 'Excellent service! My house has never been cleaner. The team was professional and thorough.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
  ('book_sc_review_002', 'org_sparkle_clean_123', 'cust_sc_002', 'svc_sc_deep', 'loc_sc_main', CURRENT_DATE - INTERVAL '45 days', '14:00', 240, 250.00, 'COMPLETED', NULL, 5, 'Outstanding deep clean. They got every corner and were very careful with our belongings.', NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days'),
  ('book_sc_review_003', 'org_sparkle_clean_123', 'cust_sc_003', 'svc_sc_office', 'loc_sc_north', CURRENT_DATE - INTERVAL '20 days', '18:00', 180, 200.00, 'COMPLETED', NULL, 4, 'Great job on our office. Only minor issue was they arrived 10 minutes late, but cleaned very well.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
  
  -- QuickFix Reviews  
  ('book_qf_review_001', 'org_quickfix_456', 'cust_qf_001', 'svc_qf_emergency', 'loc_qf_dallas', CURRENT_DATE - INTERVAL '40 days', '22:00', 60, 150.00, 'COMPLETED', NULL, 5, 'Lifesaver! Came out at 10PM to fix our burst pipe. Fast, professional, and fair pricing.', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days'),
  ('book_qf_review_002', 'org_quickfix_456', 'cust_qf_003', 'svc_qf_install', 'loc_qf_dallas', CURRENT_DATE - INTERVAL '25 days', '09:00', 180, 225.00, 'COMPLETED', NULL, 5, 'Installed new fixtures in all 5 of our properties. Excellent work and very reliable.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days');

-- Add more historical bookings for revenue trends
INSERT INTO "Booking" (id, "organizationId", "customerId", "serviceId", "locationId", "scheduledDate", "scheduledTime", duration, price, status, "createdAt", "updatedAt")
SELECT 
  'book_sc_bulk_' || generate_series,
  'org_sparkle_clean_123',
  CASE (generate_series % 5)
    WHEN 0 THEN 'cust_sc_001'
    WHEN 1 THEN 'cust_sc_002'
    WHEN 2 THEN 'cust_sc_003'
    WHEN 3 THEN 'cust_sc_004'
    ELSE 'cust_sc_005'
  END,
  CASE (generate_series % 4)
    WHEN 0 THEN 'svc_sc_basic'
    WHEN 1 THEN 'svc_sc_deep'
    WHEN 2 THEN 'svc_sc_office'
    ELSE 'svc_sc_move'
  END,
  CASE (generate_series % 2)
    WHEN 0 THEN 'loc_sc_main'
    ELSE 'loc_sc_north'
  END,
  CURRENT_DATE - (generate_series || ' days')::INTERVAL,
  CASE (generate_series % 4)
    WHEN 0 THEN '09:00'
    WHEN 1 THEN '11:00'
    WHEN 2 THEN '14:00'
    ELSE '16:00'
  END,
  CASE (generate_series % 4)
    WHEN 0 THEN 120
    WHEN 1 THEN 240
    WHEN 2 THEN 180
    ELSE 300
  END,
  CASE (generate_series % 4)
    WHEN 0 THEN 120.00
    WHEN 1 THEN 250.00
    WHEN 2 THEN 200.00
    ELSE 350.00
  END,
  'COMPLETED',
  NOW() - (generate_series || ' days')::INTERVAL,
  NOW() - (generate_series || ' days')::INTERVAL
FROM generate_series(35, 90, 3);

-- Add Budget records for Sparkle Clean (Premium feature)
INSERT INTO "Budget" (id, "organizationId", "categoryId", "monthYear", amount, spent, "createdAt", "updatedAt")
VALUES
  ('budget_sc_001', 'org_sparkle_clean_123', NULL, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 2000.00, 450.00, NOW() - INTERVAL '1 month', NOW()),
  ('budget_sc_002', 'org_sparkle_clean_123', NULL, TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM'), 2000.00, 1850.00, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month'),
  ('budget_sc_003', 'org_sparkle_clean_123', NULL, TO_CHAR(CURRENT_DATE - INTERVAL '2 months', 'YYYY-MM'), 1800.00, 1950.00, NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months');

-- Final summary output
SELECT 
  'Demo data created successfully!' as message,
  COUNT(DISTINCT o.id) as organizations,
  COUNT(DISTINCT c.id) as customers,
  COUNT(DISTINCT s.id) as services,
  COUNT(DISTINCT b.id) as bookings,
  COUNT(DISTINCT e.id) as expenses,
  COUNT(DISTINCT m.id) as campaigns
FROM "Organization" o
LEFT JOIN "Customer" c ON c."organizationId" = o.id
LEFT JOIN "Service" s ON s."organizationId" = o.id
LEFT JOIN "Booking" b ON b."organizationId" = o.id
LEFT JOIN "Expense" e ON e."organizationId" = o.id
LEFT JOIN "MarketingCampaign" m ON m."organizationId" = o.id
WHERE o.email IN ('demo@sparkleclean.com', 'demo@quickfixplumbing.com', 'demo@brightdental.com');