-- First, let's check if there are any appointments without leads
-- and handle them before making the column NOT NULL

-- Update any existing appointments without leads to have a default value
-- We'll need to either assign them to a lead or handle them appropriately
-- For now, let's see what we have first

-- Check for appointments without leads
SELECT count(*) FROM appointments WHERE lead_id IS NULL;

-- Make lead_id NOT NULL in appointments table
ALTER TABLE appointments ALTER COLUMN lead_id SET NOT NULL;