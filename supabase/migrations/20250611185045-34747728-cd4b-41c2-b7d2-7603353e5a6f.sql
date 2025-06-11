
-- Adicionar campos de configuração na tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
ADD COLUMN IF NOT EXISTS billing_settings JSONB DEFAULT '{"auto_billing": true, "invoice_email": null}'::jsonb;

-- Criar tabela para configurações específicas da empresa
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, setting_key)
);

-- Adicionar RLS para company_settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Policy para company_settings (apenas usuários da mesma empresa)
CREATE POLICY "Users can manage their company settings" 
  ON public.company_settings 
  FOR ALL 
  USING (company_id = public.get_current_user_company_id());

-- Criar tabela para logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy para audit_logs (apenas usuários da mesma empresa podem ver)
CREATE POLICY "Users can view their company audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (company_id = public.get_current_user_company_id());

-- Melhorar as permissões no sistema de roles
UPDATE public.roles 
SET permissions = permissions || '{"view_audit_logs": false, "manage_integrations": false, "manage_billing": false}'::jsonb
WHERE permissions IS NOT NULL;

-- Dar permissões completas para Admin
UPDATE public.roles 
SET permissions = '{"admin": true, "manage_users": true, "manage_roles": true, "manage_leads": true, "manage_appointments": true, "manage_scripts": true, "manage_tasks": true, "view_reports": true, "view_audit_logs": true, "manage_integrations": true, "manage_billing": true}'::jsonb
WHERE name = 'Admin';
