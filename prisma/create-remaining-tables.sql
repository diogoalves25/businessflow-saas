-- BusinessFlow SaaS - Create Remaining Tables
-- These tables are still needed to complete all features

-- ============================================
-- PAYROLL INTEGRATION TABLES
-- ============================================

-- Plaid Connection for Bank Integration
CREATE TABLE IF NOT EXISTS "PlaidConnection" (
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

-- Payroll Run
CREATE TABLE IF NOT EXISTS "PayrollRun" (
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

-- Payroll Payment
CREATE TABLE IF NOT EXISTS "PayrollPayment" (
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

-- ============================================
-- MARKETING AUTOMATION TABLES
-- ============================================

-- Marketing Campaign
CREATE TABLE IF NOT EXISTS "MarketingCampaign" (
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

-- Marketing Contact (no dependency on Customer table)
CREATE TABLE IF NOT EXISTS "MarketingContact" (
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

-- Campaign Activity
CREATE TABLE IF NOT EXISTS "CampaignActivity" (
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

-- Contact Preference
CREATE TABLE IF NOT EXISTS "ContactPreference" (
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

-- ============================================
-- AD INTEGRATION TABLES
-- ============================================

-- Ad Account
CREATE TABLE IF NOT EXISTS "AdAccount" (
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

-- Ad Campaign
CREATE TABLE IF NOT EXISTS "AdCampaign" (
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

-- ============================================
-- SECURITY TABLES
-- ============================================

-- Audit Log
CREATE TABLE IF NOT EXISTS "AuditLog" (
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

-- Two Factor Auth
CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
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

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "Expense_organizationId_date_idx" ON "Expense"("organizationId", "date");
CREATE INDEX IF NOT EXISTS "Expense_source_idx" ON "Expense"("source");
CREATE INDEX IF NOT EXISTS "MarketingCampaign_organizationId_status_idx" ON "MarketingCampaign"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "CampaignActivity_campaignId_type_idx" ON "CampaignActivity"("campaignId", "type");
CREATE INDEX IF NOT EXISTS "PayrollRun_organizationId_payPeriodEnd_idx" ON "PayrollRun"("organizationId", "payPeriodEnd");

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Create update trigger for updatedAt if not exists
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updatedAt triggers to new tables
CREATE TRIGGER set_timestamp_plaidconnection
  BEFORE UPDATE ON "PlaidConnection"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_payrollrun
  BEFORE UPDATE ON "PayrollRun"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_marketingcampaign
  BEFORE UPDATE ON "MarketingCampaign"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_marketingcontact
  BEFORE UPDATE ON "MarketingContact"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_contactpreference
  BEFORE UPDATE ON "ContactPreference"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_adaccount
  BEFORE UPDATE ON "AdAccount"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_adcampaign
  BEFORE UPDATE ON "AdCampaign"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_twofa
  BEFORE UPDATE ON "TwoFactorAuth"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- SUMMARY
-- ============================================

-- List all tables that should now exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'Booking', 'Budget', 'ChatMessage', 'ChatSession', 
      'Expense', 'ExpenseCategory', 'Organization', 
      'Revenue', 'Service', 'User', 'WhiteLabelSettings'
    ) THEN 'Already Created'
    ELSE 'Newly Created'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN (
  -- Core Tables
  'Organization', 'User', 'Service', 'Booking', 'Revenue',
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
)
ORDER BY status, table_name;