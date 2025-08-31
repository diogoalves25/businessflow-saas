-- BusinessFlow SaaS - Add Missing Columns to Match Prisma Schema
-- Run this to update your database tables with missing columns

-- ============================================
-- ORGANIZATION TABLE - Missing Columns
-- ============================================
-- Database has: subscriptionTier, subscriptionStartDate, subscriptionEndDate, lastPaymentDate, paymentMethod
-- Prisma needs: stripeSubscriptionId, stripePriceId, subscriptionStatus, trialEndsAt, subscriptionEndsAt, notificationPreferences, aiTokensUsed

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS "notificationPreferences" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "aiTokensUsed" INTEGER DEFAULT 0;

-- Note: subscriptionEndsAt might map to existing subscriptionEndDate
-- If you want to keep using subscriptionEndDate, we can rename it:
-- ALTER TABLE "Organization" RENAME COLUMN "subscriptionEndDate" TO "subscriptionEndsAt";

-- ============================================
-- USER TABLE - Missing Columns
-- ============================================
-- Database has: firstName, lastName (separate)
-- Prisma has: firstName, lastName (separate) but also needs: name, hourlyRate
-- Note: The User table is missing 'name' field from original schema but has firstName/lastName

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "hourlyRate" DOUBLE PRECISION;

-- ============================================
-- SERVICE TABLE - Missing Columns
-- ============================================
-- Database has: basePrice, duration, icon
-- Prisma needs: isActive (missing from database)

ALTER TABLE "Service"
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- ============================================
-- BOOKING TABLE - Missing Columns
-- ============================================
-- Database has most fields but missing notification tracking fields

ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "confirmationSentAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "scheduledTime" TEXT,
ADD COLUMN IF NOT EXISTS "userId" TEXT,
ADD COLUMN IF NOT EXISTS "locationId" TEXT;

-- ============================================
-- REVENUE TABLE - Complete Restructure Needed
-- ============================================
-- Database has: month, year, amount
-- Prisma needs: organizationId, bookingId, date, type

ALTER TABLE "Revenue"
ADD COLUMN IF NOT EXISTS "organizationId" TEXT,
ADD COLUMN IF NOT EXISTS "bookingId" TEXT,
ADD COLUMN IF NOT EXISTS "date" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'SERVICE',
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- EXPENSE TABLE - Missing Columns
-- ============================================
-- Already has most columns, ensure receiptUrl is nullable as expected

-- ============================================
-- CUSTOMER TABLE - Needs Creation
-- ============================================
-- The Customer table exists but Prisma schema doesn't have a Customer model
-- This suggests the app might be using User table for customers
-- No action needed unless you want to keep Customer table

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================
-- Add foreign key constraints for new columns

-- Organization foreign keys already exist

-- User foreign key to Organization (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'User_organizationId_fkey') THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Booking foreign keys for new columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Booking_userId_fkey') THEN
        ALTER TABLE "Booking" 
        ADD CONSTRAINT "Booking_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Booking_locationId_fkey') THEN
        ALTER TABLE "Booking" 
        ADD CONSTRAINT "Booking_locationId_fkey" 
        FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Revenue foreign keys for new columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Revenue_organizationId_fkey') THEN
        ALTER TABLE "Revenue" 
        ADD CONSTRAINT "Revenue_organizationId_fkey" 
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Revenue_bookingId_fkey') THEN
        ALTER TABLE "Revenue" 
        ADD CONSTRAINT "Revenue_bookingId_fkey" 
        FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- RENAME COLUMNS TO MATCH PRISMA SCHEMA
-- ============================================
-- If you want to use Prisma's expected names instead of current names:

-- Organization table renames (optional)
-- ALTER TABLE "Organization" RENAME COLUMN "subscriptionEndDate" TO "subscriptionEndsAt";
-- ALTER TABLE "Organization" RENAME COLUMN "subscriptionStartDate" TO "trialStartsAt";

-- Booking table rename (if technicianId should map to userId)
-- Note: Booking has both technicianId and needs userId for the creator

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS "Organization_stripeSubscriptionId_idx" ON "Organization"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX IF NOT EXISTS "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX IF NOT EXISTS "Booking_locationId_idx" ON "Booking"("locationId");
CREATE INDEX IF NOT EXISTS "Revenue_organizationId_idx" ON "Revenue"("organizationId");
CREATE INDEX IF NOT EXISTS "Revenue_bookingId_idx" ON "Revenue"("bookingId");

-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT 
    'Columns added successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Organization' AND column_name IN ('stripeSubscriptionId', 'stripePriceId', 'subscriptionStatus', 'trialEndsAt', 'notificationPreferences', 'aiTokensUsed')) as org_new_columns,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'hourlyRate') as user_new_columns,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Service' AND column_name = 'isActive') as service_new_columns,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Booking' AND column_name IN ('confirmationSentAt', 'reminderSentAt', 'userId', 'locationId')) as booking_new_columns,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Revenue' AND column_name IN ('organizationId', 'bookingId', 'date', 'type')) as revenue_new_columns;