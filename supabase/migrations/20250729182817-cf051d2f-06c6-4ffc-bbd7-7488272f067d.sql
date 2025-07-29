-- Remove start_date and end_date columns from user_goals table
ALTER TABLE user_goals DROP COLUMN IF EXISTS start_date;
ALTER TABLE user_goals DROP COLUMN IF EXISTS end_date;