-- BusinessFlow SaaS - Create Missing Tables
-- Run this script to add the remaining tables

-- ============================================
-- CORE TABLES (Customer, Location)
-- ============================================

-- Customer table
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- Location table
CREATE TABLE IF NOT EXISTS "Location" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "zipCode" TEXT,
  "country" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Location_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Location_organizationId_idx" ON "Location"("organizationId");

-- ============================================
-- PAYROLL TABLES
-- ============================================

-- PlaidConnection for bank integration
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
  CONSTRAINT "PlaidConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PlaidConnection_organizationId_key" ON "PlaidConnection"("organizationId");

-- PayrollRun table
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
  "summary" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayrollRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PayrollRun_organizationId_idx" ON "PayrollRun"("organizationId");
CREATE INDEX "PayrollRun_status_idx" ON "PayrollRun"("status");

-- PayrollPayment table
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
  "details" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "PayrollPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayrollPayment_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PayrollPayment_payrollRunId_idx" ON "PayrollPayment"("payrollRunId");

-- ============================================
-- MARKETING TABLES
-- ============================================

-- MarketingCampaign table
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
  "targetAudience" JSONB DEFAULT '{}'::jsonb,
  "content" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "metrics" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketingCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MarketingCampaign_organizationId_idx" ON "MarketingCampaign"("organizationId");
CREATE INDEX "MarketingCampaign_status_idx" ON "MarketingCampaign"("status");

-- MarketingContact table
CREATE TABLE IF NOT EXISTS "MarketingContact" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "phone" TEXT,
  "tags" TEXT[],
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastEngagement" TIMESTAMP(3),
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "MarketingContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketingContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MarketingContact_organizationId_email_key" ON "MarketingContact"("organizationId", "email");
CREATE INDEX "MarketingContact_status_idx" ON "MarketingContact"("status");

-- CampaignActivity table
CREATE TABLE IF NOT EXISTS "CampaignActivity" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "campaignId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "CampaignActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CampaignActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CampaignActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CampaignActivity_campaignId_idx" ON "CampaignActivity"("campaignId");
CREATE INDEX "CampaignActivity_contactId_idx" ON "CampaignActivity"("contactId");

-- ContactPreference table
CREATE TABLE IF NOT EXISTS "ContactPreference" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "contactId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "optedIn" BOOLEAN NOT NULL DEFAULT true,
  "frequency" TEXT DEFAULT 'NORMAL',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ContactPreference_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactPreference_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContactPreference_contactId_channel_key" ON "ContactPreference"("contactId", "channel");

-- ============================================
-- AD MANAGEMENT TABLES
-- ============================================

-- AdAccount table
CREATE TABLE IF NOT EXISTS "AdAccount" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AdAccount_organizationId_platform_accountId_key" ON "AdAccount"("organizationId", "platform", "accountId");

-- AdCampaign table
CREATE TABLE IF NOT EXISTS "AdCampaign" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "adAccountId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "budget" DECIMAL(10,2),
  "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "targeting" JSONB DEFAULT '{}'::jsonb,
  "creatives" JSONB DEFAULT '{}'::jsonb,
  "performance" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdCampaign_adAccountId_fkey" FOREIGN KEY ("adAccountId") REFERENCES "AdAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AdCampaign_adAccountId_idx" ON "AdCampaign"("adAccountId");
CREATE INDEX "AdCampaign_organizationId_idx" ON "AdCampaign"("organizationId");
CREATE INDEX "AdCampaign_status_idx" ON "AdCampaign"("status");

-- ============================================
-- SECURITY TABLES
-- ============================================

-- AuditLog table
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- TwoFactorAuth table
CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT[],
  "isEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TwoFactorAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TwoFactorAuth_userId_key" ON "TwoFactorAuth"("userId");

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after creating tables to verify
SELECT 
    COUNT(*) as "Total Tables",
    COUNT(*) FILTER (WHERE table_name IN ('Organization', 'User', 'Service', 'Booking', 'Revenue', 'Customer', 'Location')) as "Core Tables (7)",
    COUNT(*) FILTER (WHERE table_name IN ('ChatSession', 'ChatMessage')) as "AI Chat Tables (2)",
    COUNT(*) FILTER (WHERE table_name IN ('PlaidConnection', 'PayrollRun', 'PayrollPayment')) as "Payroll Tables (3)",
    COUNT(*) FILTER (WHERE table_name IN ('MarketingCampaign', 'MarketingContact', 'CampaignActivity', 'ContactPreference')) as "Marketing Tables (4)",
    COUNT(*) FILTER (WHERE table_name IN ('AdAccount', 'AdCampaign')) as "Ad Tables (2)",
    COUNT(*) FILTER (WHERE table_name IN ('Expense', 'ExpenseCategory', 'Budget')) as "Expense Tables (3)",
    COUNT(*) FILTER (WHERE table_name IN ('WhiteLabelSettings')) as "White Label Tables (1)",
    COUNT(*) FILTER (WHERE table_name IN ('AuditLog', 'TwoFactorAuth')) as "Security Tables (2)"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';