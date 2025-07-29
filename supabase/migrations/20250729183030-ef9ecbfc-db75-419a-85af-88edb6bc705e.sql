-- Drop existing policies for user_goals
DROP POLICY IF EXISTS "Admins can create user goals for their company" ON user_goals;
DROP POLICY IF EXISTS "Admins can update user goals for their company" ON user_goals;
DROP POLICY IF EXISTS "Admins can delete user goals for their company" ON user_goals;
DROP POLICY IF EXISTS "Users can view their company user goals" ON user_goals;

-- Create new simplified RLS policies for user_goals
-- Users can view goals from their company
CREATE POLICY "Users can view their company user goals" 
ON user_goals 
FOR SELECT 
USING (company_id IN (
  SELECT company_id 
  FROM profiles 
  WHERE id = auth.uid()
));

-- Admins can create goals for their company
CREATE POLICY "Admins can create user goals for their company" 
ON user_goals 
FOR INSERT 
WITH CHECK (
  is_current_user_admin() 
  AND company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Admins can update goals for their company
CREATE POLICY "Admins can update user goals for their company" 
ON user_goals 
FOR UPDATE 
USING (
  is_current_user_admin() 
  AND company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Admins can delete goals for their company
CREATE POLICY "Admins can delete user goals for their company" 
ON user_goals 
FOR DELETE 
USING (
  is_current_user_admin() 
  AND company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);