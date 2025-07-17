-- Handle existing appointments without leads
-- Option 1: Delete appointments without leads (safest approach for enforcing the new constraint)
DELETE FROM appointments WHERE lead_id IS NULL;

-- Now make lead_id NOT NULL
ALTER TABLE appointments ALTER COLUMN lead_id SET NOT NULL;