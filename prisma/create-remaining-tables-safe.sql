-- BusinessFlow SaaS - Safely Create Remaining Tables
-- This script checks what exists and only creates missing tables

-- First, let's see what tables we already have
SELECT 'Current tables in database:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Now let's check which feature tables are missing and create them

-- ============================================
-- PAYROLL INTEGRATION TABLES
-- ============================================

-- Check and create PlaidConnection
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PlaidConnection') THEN
    CREATE TABLE "PlaidConnection" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "accessToken" TEXT NOT NULL,
      "itemId" TEXT NOT NULL,
      "institutionId" TEXT NOT NULL,
      "institutionName" TEXT NOT NULL,
      "accounts" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PlaidConnection_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "PlaidConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "PlaidConnection_organizationId_key" ON "PlaidConnection"("organizationId");
    RAISE NOTICE 'Created table: PlaidConnection';
  ELSE
    RAISE NOTICE 'Table already exists: PlaidConnection';
  END IF;
END $$;

-- Check and create PayrollRun
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PayrollRun') THEN
    CREATE TABLE "PayrollRun" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "payPeriodStart" TIMESTAMP(3) NOT NULL,
      "payPeriodEnd" TIMESTAMP(3) NOT NULL,
      "processedAt" TIMESTAMP(3),
      "totalGross" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "totalNet" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "totalTaxes" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "summary" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "PayrollRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    RAISE NOTICE 'Created table: PayrollRun';
  ELSE
    RAISE NOTICE 'Table already exists: PayrollRun';
  END IF;
END $$;

-- Check and create PayrollPayment
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PayrollPayment') THEN
    CREATE TABLE "PayrollPayment" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "payrollRunId" TEXT NOT NULL,
      "employeeName" TEXT NOT NULL,
      "grossPay" DECIMAL(10,2) NOT NULL,
      "netPay" DECIMAL(10,2) NOT NULL,
      "federalTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "stateTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "socialSecurity" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "medicare" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "details" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PayrollPayment_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "PayrollPayment_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    RAISE NOTICE 'Created table: PayrollPayment';
  ELSE
    RAISE NOTICE 'Table already exists: PayrollPayment';
  END IF;
END $$;

-- ============================================
-- MARKETING AUTOMATION TABLES
-- ============================================

-- Check and create MarketingCampaign
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'MarketingCampaign') THEN
    CREATE TABLE "MarketingCampaign" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "budget" DECIMAL(10,2),
      "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "targetAudience" JSONB,
      "content" JSONB NOT NULL,
      "metrics" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "MarketingCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    RAISE NOTICE 'Created table: MarketingCampaign';
  ELSE
    RAISE NOTICE 'Table already exists: MarketingCampaign';
  END IF;
END $$;

-- Check and create MarketingContact
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'MarketingContact') THEN
    CREATE TABLE "MarketingContact" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "customerId" TEXT,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "firstName" TEXT,
      "lastName" TEXT,
      "tags" TEXT[],
      "segments" TEXT[],
      "preferences" JSONB NOT NULL DEFAULT '{}',
      "unsubscribedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MarketingContact_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "MarketingContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "MarketingContact_organizationId_email_key" ON "MarketingContact"("organizationId", "email");
    RAISE NOTICE 'Created table: MarketingContact';
  ELSE
    RAISE NOTICE 'Table already exists: MarketingContact';
  END IF;
END $$;

-- Check and create CampaignActivity
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CampaignActivity') THEN
    CREATE TABLE "CampaignActivity" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "campaignId" TEXT NOT NULL,
      "contactId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "metadata" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CampaignActivity_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "CampaignActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "CampaignActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    RAISE NOTICE 'Created table: CampaignActivity';
  ELSE
    RAISE NOTICE 'Table already exists: CampaignActivity';
  END IF;
END $$;

-- Check and create ContactPreference
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ContactPreference') THEN
    CREATE TABLE "ContactPreference" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "contactId" TEXT NOT NULL,
      "channel" TEXT NOT NULL,
      "optedIn" BOOLEAN NOT NULL DEFAULT true,
      "frequency" TEXT,
      "topics" TEXT[],
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ContactPreference_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "ContactPreference_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "ContactPreference_contactId_channel_key" ON "ContactPreference"("contactId", "channel");
    RAISE NOTICE 'Created table: ContactPreference';
  ELSE
    RAISE NOTICE 'Table already exists: ContactPreference';
  END IF;
END $$;

-- ============================================
-- AD INTEGRATION TABLES
-- ============================================

-- Check and create AdAccount
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AdAccount') THEN
    CREATE TABLE "AdAccount" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "platform" TEXT NOT NULL,
      "accountId" TEXT NOT NULL,
      "accountName" TEXT NOT NULL,
      "accessToken" TEXT NOT NULL,
      "refreshToken" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "lastSyncedAt" TIMESTAMP(3),
      "settings" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "AdAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "AdAccount_organizationId_platform_accountId_key" ON "AdAccount"("organizationId", "platform", "accountId");
    RAISE NOTICE 'Created table: AdAccount';
  ELSE
    RAISE NOTICE 'Table already exists: AdAccount';
  END IF;
END $$;

-- Check and create AdCampaign
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AdCampaign') THEN
    CREATE TABLE "AdCampaign" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "adAccountId" TEXT NOT NULL,
      "externalId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "budget" DECIMAL(10,2),
      "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "impressions" INTEGER NOT NULL DEFAULT 0,
      "clicks" INTEGER NOT NULL DEFAULT 0,
      "conversions" INTEGER NOT NULL DEFAULT 0,
      "costPerClick" DECIMAL(10,2),
      "costPerConversion" DECIMAL(10,2),
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "metadata" JSONB,
      "lastSyncedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "AdCampaign_adAccountId_fkey" FOREIGN KEY ("adAccountId") REFERENCES "AdAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "AdCampaign_adAccountId_externalId_key" ON "AdCampaign"("adAccountId", "externalId");
    RAISE NOTICE 'Created table: AdCampaign';
  ELSE
    RAISE NOTICE 'Table already exists: AdCampaign';
  END IF;
END $$;

-- ============================================
-- SECURITY TABLES
-- ============================================

-- Check and create AuditLog
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AuditLog') THEN
    CREATE TABLE "AuditLog" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "userId" TEXT,
      "action" TEXT NOT NULL,
      "resource" TEXT NOT NULL,
      "resourceId" TEXT,
      "oldValues" JSONB,
      "newValues" JSONB,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");
    CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
    CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
    RAISE NOTICE 'Created table: AuditLog';
  ELSE
    RAISE NOTICE 'Table already exists: AuditLog';
  END IF;
END $$;

-- Check and create TwoFactorAuth
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'TwoFactorAuth') THEN
    CREATE TABLE "TwoFactorAuth" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "organizationId" TEXT NOT NULL,
      "secret" TEXT NOT NULL,
      "backupCodes" TEXT[],
      "isEnabled" BOOLEAN NOT NULL DEFAULT false,
      "lastUsedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "TwoFactorAuth_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
    CREATE UNIQUE INDEX "TwoFactorAuth_organizationId_key" ON "TwoFactorAuth"("organizationId");
    RAISE NOTICE 'Created table: TwoFactorAuth';
  ELSE
    RAISE NOTICE 'Table already exists: TwoFactorAuth';
  END IF;
END $$;

-- ============================================
-- CREATE OR UPDATE TRIGGERS
-- ============================================

-- Create update trigger function if not exists
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers only if they don't exist
DO $$ 
BEGIN
  -- PlaidConnection trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_plaidconnection') THEN
    CREATE TRIGGER set_timestamp_plaidconnection
      BEFORE UPDATE ON "PlaidConnection"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- PayrollRun trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_payrollrun') THEN
    CREATE TRIGGER set_timestamp_payrollrun
      BEFORE UPDATE ON "PayrollRun"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- MarketingCampaign trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_marketingcampaign') THEN
    CREATE TRIGGER set_timestamp_marketingcampaign
      BEFORE UPDATE ON "MarketingCampaign"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- MarketingContact trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_marketingcontact') THEN
    CREATE TRIGGER set_timestamp_marketingcontact
      BEFORE UPDATE ON "MarketingContact"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- ContactPreference trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_contactpreference') THEN
    CREATE TRIGGER set_timestamp_contactpreference
      BEFORE UPDATE ON "ContactPreference"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- AdAccount trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_adaccount') THEN
    CREATE TRIGGER set_timestamp_adaccount
      BEFORE UPDATE ON "AdAccount"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- AdCampaign trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_adcampaign') THEN
    CREATE TRIGGER set_timestamp_adcampaign
      BEFORE UPDATE ON "AdCampaign"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;

  -- TwoFactorAuth trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_twofa') THEN
    CREATE TRIGGER set_timestamp_twofa
      BEFORE UPDATE ON "TwoFactorAuth"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END $$;

-- ============================================
-- CREATE MISSING INDEXES
-- ============================================

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "Expense_organizationId_date_idx" ON "Expense"("organizationId", "date");
CREATE INDEX IF NOT EXISTS "Expense_source_idx" ON "Expense"("source");
CREATE INDEX IF NOT EXISTS "MarketingCampaign_organizationId_status_idx" ON "MarketingCampaign"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "CampaignActivity_campaignId_type_idx" ON "CampaignActivity"("campaignId", "type");
CREATE INDEX IF NOT EXISTS "PayrollRun_organizationId_payPeriodEnd_idx" ON "PayrollRun"("organizationId", "payPeriodEnd");

-- ============================================
-- FINAL SUMMARY
-- ============================================

SELECT 'Tables after running this script:' as info;
SELECT table_name, 
       CASE 
         WHEN table_name IN ('Organization', 'User', 'Service', 'Booking', 'Revenue',
                            'ChatSession', 'ChatMessage', 'Expense', 'ExpenseCategory', 
                            'Budget', 'WhiteLabelSettings') 
         THEN 'Core/Already Existed'
         ELSE 'Feature Table'
       END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_type, table_name;

-- Count tables by category
SELECT 'Table Summary:' as info;
SELECT 
  COUNT(*) FILTER (WHERE table_name IN ('Organization', 'User', 'Service', 'Booking', 'Revenue')) as "Core Tables",
  COUNT(*) FILTER (WHERE table_name IN ('ChatSession', 'ChatMessage')) as "AI Chat Tables",
  COUNT(*) FILTER (WHERE table_name IN ('PlaidConnection', 'PayrollRun', 'PayrollPayment')) as "Payroll Tables",
  COUNT(*) FILTER (WHERE table_name IN ('MarketingCampaign', 'MarketingContact', 'CampaignActivity', 'ContactPreference')) as "Marketing Tables",
  COUNT(*) FILTER (WHERE table_name IN ('AdAccount', 'AdCampaign')) as "Ad Tables",
  COUNT(*) FILTER (WHERE table_name IN ('Expense', 'ExpenseCategory', 'Budget')) as "Expense Tables",
  COUNT(*) FILTER (WHERE table_name = 'WhiteLabelSettings') as "White Label Tables",
  COUNT(*) FILTER (WHERE table_name IN ('AuditLog', 'TwoFactorAuth')) as "Security Tables",
  COUNT(*) as "Total Tables"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';