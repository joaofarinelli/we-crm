-- Fix infinite recursion in profiles RLS policies
DROP POLICY IF EXISTS "Users can view their company profiles" ON public.profiles;

-- Create a safe profile policy that doesn't cause recursion
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (
  id = auth.uid()
);

-- Create missing tables
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Progresso', 'Concluída', 'Cancelada')),
  priority TEXT DEFAULT 'Média' CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Urgente')),
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  notes TEXT,
  company_name TEXT,
  source TEXT,
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Em Andamento', 'Concluída', 'Cancelada')),
  meeting_type TEXT DEFAULT 'Presencial' CHECK (meeting_type IN ('Presencial', 'Online', 'Telefone')),
  location TEXT,
  meeting_url TEXT,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pipeline_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  position INTEGER NOT NULL DEFAULT 0,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_columns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their company tasks" ON public.tasks FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create tasks for their company" ON public.tasks FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company tasks" ON public.tasks FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company tasks" ON public.tasks FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create RLS policies for contacts
CREATE POLICY "Users can view their company contacts" ON public.contacts FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create contacts for their company" ON public.contacts FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company contacts" ON public.contacts FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company contacts" ON public.contacts FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create RLS policies for meetings
CREATE POLICY "Users can view their company meetings" ON public.meetings FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create meetings for their company" ON public.meetings FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company meetings" ON public.meetings FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company meetings" ON public.meetings FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create RLS policies for pipeline_columns
CREATE POLICY "Users can view their company pipeline columns" ON public.pipeline_columns FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create pipeline columns for their company" ON public.pipeline_columns FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company pipeline columns" ON public.pipeline_columns FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company pipeline columns" ON public.pipeline_columns FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create missing RPC functions
CREATE OR REPLACE FUNCTION public.is_saas_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_role_name text;
BEGIN
  SELECT r.name INTO user_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  RETURN user_role_name IN ('Administrador do Sistema', 'SaaS Admin', 'Super Admin');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_saas_admin_for_company_management()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN public.is_saas_admin();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_advanced_saas_analytics()
RETURNS TABLE(
  total_companies bigint,
  total_users bigint,
  total_leads bigint,
  total_appointments bigint,
  active_companies bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow SaaS admins to access this function
  IF NOT public.is_saas_admin() THEN
    RAISE EXCEPTION 'Access denied. SaaS admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.companies)::bigint as total_companies,
    (SELECT COUNT(*) FROM public.profiles)::bigint as total_users,
    (SELECT COUNT(*) FROM public.leads)::bigint as total_leads,
    (SELECT COUNT(*) FROM public.appointments)::bigint as total_appointments,
    (SELECT COUNT(*) FROM public.companies WHERE status = 'Ativo')::bigint as active_companies;
END;
$$;

-- Create system roles
INSERT INTO public.roles (name, description, is_system_role, company_id) VALUES
('Administrador do Sistema', 'Administrador completo do sistema SaaS', true, null),
('Administrador', 'Administrador da empresa', false, null),
('Gerente', 'Gerente de vendas', false, null),
('Vendedor', 'Representante de vendas', false, null),
('Usuário', 'Usuário básico', false, null)
ON CONFLICT DO NOTHING;

-- Create default pipeline columns for new companies
CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pipeline_columns (name, color, position, company_id) VALUES
    ('Novo Lead', '#EF4444', 0, NEW.id),
    ('Qualificado', '#F59E0B', 1, NEW.id),
    ('Proposta', '#3B82F6', 2, NEW.id),
    ('Negociação', '#8B5CF6', 3, NEW.id),
    ('Fechado', '#10B981', 4, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_pipeline_columns_on_company_creation
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_pipeline_columns();

-- Create triggers for updated_at columns
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pipeline_columns_updated_at BEFORE UPDATE ON public.pipeline_columns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();