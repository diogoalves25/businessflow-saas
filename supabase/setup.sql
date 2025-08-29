-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a trigger to automatically set organizationId for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Update the User record with auth metadata
  UPDATE public."User"
  SET 
    email = NEW.email,
    "organizationId" = NEW.raw_user_meta_data->>'organizationId'
  WHERE id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Revenue" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own organization" ON "Organization";
DROP POLICY IF EXISTS "Users can update own organization" ON "Organization";
DROP POLICY IF EXISTS "Users can view organization members" ON "User";
DROP POLICY IF EXISTS "Users can view organization services" ON "Service";
DROP POLICY IF EXISTS "Users can manage organization services" ON "Service";
DROP POLICY IF EXISTS "Users can view organization bookings" ON "Booking";
DROP POLICY IF EXISTS "Users can create bookings" ON "Booking";
DROP POLICY IF EXISTS "Users can update organization bookings" ON "Booking";
DROP POLICY IF EXISTS "Public can view revenue" ON "Revenue";

-- Organization Policies
CREATE POLICY "Users can view own organization" ON "Organization"
  FOR SELECT USING (
    id IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own organization" ON "Organization"
  FOR UPDATE USING (
    id IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- User Policies  
CREATE POLICY "Users can view organization members" ON "User"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text
    )
  );

-- Service Policies
CREATE POLICY "Users can view organization services" ON "Service"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage organization services" ON "Service"
  FOR ALL USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Booking Policies
CREATE POLICY "Users can view organization bookings" ON "Booking"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create bookings" ON "Booking"
  FOR INSERT WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update organization bookings" ON "Booking"
  FOR UPDATE USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()::text AND (role = 'admin' OR role = 'technician')
    )
  );

-- Revenue Policies (public for demo)
CREATE POLICY "Public can view revenue" ON "Revenue"
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_organization ON "User"("organizationId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");
CREATE INDEX IF NOT EXISTS idx_service_organization ON "Service"("organizationId");
CREATE INDEX IF NOT EXISTS idx_booking_organization ON "Booking"("organizationId");
CREATE INDEX IF NOT EXISTS idx_booking_customer ON "Booking"("customerId");
CREATE INDEX IF NOT EXISTS idx_booking_technician ON "Booking"("technicianId");
CREATE INDEX IF NOT EXISTS idx_booking_date ON "Booking"("date");