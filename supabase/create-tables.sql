-- Create ENUM for BusinessType
CREATE TYPE "BusinessType" AS ENUM (
  'CLEANING',
  'PLUMBING', 
  'HVAC',
  'DENTAL',
  'BEAUTY',
  'FITNESS',
  'TUTORING',
  'AUTO_REPAIR',
  'LANDSCAPING',
  'CATERING'
);

-- Create Organization table
CREATE TABLE IF NOT EXISTS "Organization" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "businessType" "BusinessType" NOT NULL,
  "businessName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zipCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "password" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'customer',
  "organizationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create Service table
CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "duration" INTEGER NOT NULL,
  "icon" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- Create Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "customerId" TEXT NOT NULL,
  "technicianId" TEXT,
  "serviceId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "time" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zipCode" TEXT NOT NULL,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "finalPrice" DOUBLE PRECISION NOT NULL,
  "specialInstructions" TEXT,
  "rating" INTEGER,
  "review" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- Create Revenue table
CREATE TABLE IF NOT EXISTS "Revenue" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "month" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Service" ADD CONSTRAINT "Service_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" 
  FOREIGN KEY ("customerId") REFERENCES "User"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_technicianId_fkey" 
  FOREIGN KEY ("technicianId") REFERENCES "User"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" 
  FOREIGN KEY ("serviceId") REFERENCES "Service"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create update trigger for updatedAt
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updatedAt triggers to all tables
CREATE TRIGGER set_timestamp_organization
  BEFORE UPDATE ON "Organization"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_user
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_service
  BEFORE UPDATE ON "Service"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_booking
  BEFORE UPDATE ON "Booking"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();