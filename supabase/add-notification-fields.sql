-- Add notification preferences to Organization table
ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "notificationPreferences" JSONB DEFAULT '{}';

-- Add notification tracking fields to Booking table
ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP(3);

-- Create index for finding bookings that need reminders
CREATE INDEX IF NOT EXISTS "Booking_reminderSentAt_date_idx" 
ON "Booking" ("reminderSentAt", "date") 
WHERE "reminderSentAt" IS NULL AND "status" = 'scheduled';