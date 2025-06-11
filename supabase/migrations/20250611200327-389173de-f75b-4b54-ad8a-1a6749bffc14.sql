
-- Fix security policies by properly cleaning up existing ones first
-- First, let's drop all existing policies to ensure a clean slate

-- Drop all existing policies on leads table
DROP POLICY IF EXISTS "Users can view leads from their company" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads for their company" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads from their company" ON public.leads;
DROP POLICY IF EXISTS "Users can delete leads from their company" ON public.leads;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view profiles from their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop all existing policies on other tables
DROP POLICY IF EXISTS "Users can view appointments from their company" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments for their company" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments from their company" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments from their company" ON public.appointments;

DROP POLICY IF EXISTS "Users can view contacts from their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can create contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts from their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts from their company" ON public.contacts;

DROP POLICY IF EXISTS "Users can view tasks from their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks for their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks from their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks from their company" ON public.tasks;

DROP POLICY IF EXISTS "Users can view scripts from their company" ON public.scripts;
DROP POLICY IF EXISTS "Users can create scripts for their company" ON public.scripts;
DROP POLICY IF EXISTS "Users can update scripts from their company" ON public.scripts;
DROP POLICY IF EXISTS "Users can delete scripts from their company" ON public.scripts;

DROP POLICY IF EXISTS "Admins can view invitations from their company" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can create invitations for their company" ON public.user_invitations;

DROP POLICY IF EXISTS "Only SaaS admins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Only SaaS admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Only SaaS admins can create companies" ON public.companies;

-- Ensure RLS is enabled on all critical tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Now create the secure policies
-- Leads policies
CREATE POLICY "Users can view leads from their company"
  ON public.leads
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create leads for their company"
  ON public.leads
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Users can update leads from their company"
  ON public.leads
  FOR UPDATE
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can delete leads from their company"
  ON public.leads
  FOR DELETE
  USING (company_id = get_current_user_company_id());

-- Profiles policies
CREATE POLICY "Users can view profiles from their company"
  ON public.profiles
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view appointments from their company"
  ON public.appointments
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create appointments for their company"
  ON public.appointments
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Users can update appointments from their company"
  ON public.appointments
  FOR UPDATE
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can delete appointments from their company"
  ON public.appointments
  FOR DELETE
  USING (company_id = get_current_user_company_id());

-- Contacts policies
CREATE POLICY "Users can view contacts from their company"
  ON public.contacts
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create contacts for their company"
  ON public.contacts
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Users can update contacts from their company"
  ON public.contacts
  FOR UPDATE
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can delete contacts from their company"
  ON public.contacts
  FOR DELETE
  USING (company_id = get_current_user_company_id());

-- Tasks policies
CREATE POLICY "Users can view tasks from their company"
  ON public.tasks
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create tasks for their company"
  ON public.tasks
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Users can update tasks from their company"
  ON public.tasks
  FOR UPDATE
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can delete tasks from their company"
  ON public.tasks
  FOR DELETE
  USING (company_id = get_current_user_company_id());

-- Scripts policies
CREATE POLICY "Users can view scripts from their company"
  ON public.scripts
  FOR SELECT
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create scripts for their company"
  ON public.scripts
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Users can update scripts from their company"
  ON public.scripts
  FOR UPDATE
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can delete scripts from their company"
  ON public.scripts
  FOR DELETE
  USING (company_id = get_current_user_company_id());

-- User invitations policies (admin only)
CREATE POLICY "Admins can view invitations from their company"
  ON public.user_invitations
  FOR SELECT
  USING (company_id = get_current_user_company_id() AND is_current_user_admin());

CREATE POLICY "Admins can create invitations for their company"
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (company_id = get_current_user_company_id() AND is_current_user_admin());

-- Create function for secure admin-only company management (if not exists)
CREATE OR REPLACE FUNCTION public.is_saas_admin_for_company_management()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() 
    AND r.name = 'Administrador do Sistema'
  );
$$;

-- Companies policies (SaaS admin only)
CREATE POLICY "Only SaaS admins can view all companies"
  ON public.companies
  FOR SELECT
  USING (is_saas_admin_for_company_management());

CREATE POLICY "Only SaaS admins can update companies"
  ON public.companies
  FOR UPDATE
  USING (is_saas_admin_for_company_management());

CREATE POLICY "Only SaaS admins can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (is_saas_admin_for_company_management());
