-- BusinessFlow SaaS - Create Tables SQL
-- Run this after the initial 5 tables to add all new features

-- AI Chat Tables
CREATE TABLE IF NOT EXISTS "ChatSession" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChatSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "context" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Plaid Connection for Bank Integration
CREATE TABLE IF NOT EXISTS "PlaidConnection" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "institutionName" TEXT NOT NULL,
  "accounts" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PlaidConnection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlaidConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PlaidConnection_organizationId_key" ON "PlaidConnection"("organizationId");

-- Payroll Tables
CREATE TABLE IF NOT EXISTS "PayrollRun" (
  "id" TEXT NOT NULL,
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
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayrollRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PayrollPayment" (
  "id" TEXT NOT NULL,
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

-- Marketing Tables
CREATE TABLE IF NOT EXISTS "MarketingCampaign" (
  "id" TEXT NOT NULL,
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
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketingCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MarketingContact" (
  "id" TEXT NOT NULL,
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
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketingContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketingContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MarketingContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MarketingContact_organizationId_email_key" ON "MarketingContact"("organizationId", "email");

CREATE TABLE IF NOT EXISTS "CampaignActivity" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CampaignActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CampaignActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CampaignActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ContactPreference" (
  "id" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "optedIn" BOOLEAN NOT NULL DEFAULT true,
  "frequency" TEXT,
  "topics" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactPreference_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactPreference_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContactPreference_contactId_channel_key" ON "ContactPreference"("contactId", "channel");

-- Ad Account Tables
CREATE TABLE IF NOT EXISTS "AdAccount" (
  "id" TEXT NOT NULL,
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
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AdAccount_organizationId_platform_accountId_key" ON "AdAccount"("organizationId", "platform", "accountId");

CREATE TABLE IF NOT EXISTS "AdCampaign" (
  "id" TEXT NOT NULL,
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
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdCampaign_adAccountId_fkey" FOREIGN KEY ("adAccountId") REFERENCES "AdAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AdCampaign_adAccountId_externalId_key" ON "AdCampaign"("adAccountId", "externalId");

-- Expense Tables
CREATE TABLE IF NOT EXISTS "ExpenseCategory" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "businessType" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExpenseCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TYPE "ExpenseSource" AS ENUM ('MANUAL', 'GOOGLE_ADS', 'FACEBOOK_ADS', 'PAYROLL', 'TWILIO', 'SENDGRID', 'STRIPE', 'PLAID');
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

CREATE TABLE IF NOT EXISTS "Expense" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "categoryId" TEXT,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "vendor" TEXT,
  "receiptUrl" TEXT,
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  "recurringFrequency" "RecurringFrequency",
  "source" "ExpenseSource" NOT NULL DEFAULT 'MANUAL',
  "sourceId" TEXT,
  "tags" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Budget" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "categoryId" TEXT,
  "monthYear" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Budget_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Budget_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Budget_organizationId_categoryId_monthYear_key" ON "Budget"("organizationId", "categoryId", "monthYear");

-- White Label Settings
CREATE TABLE IF NOT EXISTS "WhiteLabelSettings" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "customDomain" TEXT,
  "brandName" TEXT NOT NULL,
  "logoUrl" TEXT,
  "faviconUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#0066FF',
  "secondaryColor" TEXT NOT NULL DEFAULT '#F3F4F6',
  "customCSS" TEXT,
  "emailFromName" TEXT,
  "emailFromAddress" TEXT,
  "removeBusinessFlowBranding" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WhiteLabelSettings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WhiteLabelSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WhiteLabelSettings_organizationId_key" ON "WhiteLabelSettings"("organizationId");
CREATE UNIQUE INDEX "WhiteLabelSettings_customDomain_key" ON "WhiteLabelSettings"("customDomain");

-- Security Tables
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT[],
  "isEnabled" BOOLEAN NOT NULL DEFAULT false,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TwoFactorAuth_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TwoFactorAuth_organizationId_key" ON "TwoFactorAuth"("organizationId");

-- Add missing columns to existing tables if they don't exist
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT DEFAULT 'STARTER';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "paymentMethod" JSONB;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "review" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "reviewDate" TIMESTAMP(3);

ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "Expense_organizationId_date_idx" ON "Expense"("organizationId", "date");
CREATE INDEX IF NOT EXISTS "Expense_source_idx" ON "Expense"("source");
CREATE INDEX IF NOT EXISTS "MarketingCampaign_organizationId_status_idx" ON "MarketingCampaign"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "CampaignActivity_campaignId_type_idx" ON "CampaignActivity"("campaignId", "type");
CREATE INDEX IF NOT EXISTS "PayrollRun_organizationId_payPeriodEnd_idx" ON "PayrollRun"("organizationId", "payPeriodEnd");

-- Add check constraints
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_budget_positive" CHECK ("budget" IS NULL OR "budget" > 0);

-- Create function for updating spent amounts
CREATE OR REPLACE FUNCTION update_budget_spent() RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Budget" 
  SET "spent" = (
    SELECT COALESCE(SUM("amount"), 0) 
    FROM "Expense" 
    WHERE "organizationId" = NEW."organizationId" 
    AND "categoryId" = NEW."categoryId"
    AND TO_CHAR("date", 'YYYY-MM') = "Budget"."monthYear"
  )
  WHERE "organizationId" = NEW."organizationId" 
  AND "categoryId" = NEW."categoryId"
  AND "monthYear" = TO_CHAR(NEW."date", 'YYYY-MM');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic budget updates
CREATE TRIGGER update_budget_on_expense
AFTER INSERT OR UPDATE OR DELETE ON "Expense"
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent();

-- Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Final summary
SELECT 
  'Tables created successfully!' as message,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';