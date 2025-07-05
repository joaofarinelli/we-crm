-- Add missing column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Add missing meeting-related tables
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.meeting_agendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meeting_minutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meeting_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'file',
  url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meeting_participants
CREATE POLICY "Users can view meeting participants for their company" ON public.meeting_participants
FOR SELECT USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage meeting participants for their company" ON public.meeting_participants
FOR ALL USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Create RLS policies for meeting_agendas
CREATE POLICY "Users can view meeting agendas for their company" ON public.meeting_agendas
FOR SELECT USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage meeting agendas for their company" ON public.meeting_agendas
FOR ALL USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Create RLS policies for meeting_minutes
CREATE POLICY "Users can view meeting minutes for their company" ON public.meeting_minutes
FOR SELECT USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage meeting minutes for their company" ON public.meeting_minutes
FOR ALL USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Create RLS policies for meeting_attachments
CREATE POLICY "Users can view meeting attachments for their company" ON public.meeting_attachments
FOR SELECT USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage meeting attachments for their company" ON public.meeting_attachments
FOR ALL USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Add missing functions
CREATE OR REPLACE FUNCTION public.sync_appointment_status_with_pipeline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Stub function for now
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns(target_company_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.pipeline_columns (name, color, position, company_id) VALUES
    ('Novo Lead', '#EF4444', 0, target_company_id),
    ('Qualificado', '#F59E0B', 1, target_company_id),
    ('Proposta', '#3B82F6', 2, target_company_id),
    ('Negociação', '#8B5CF6', 3, target_company_id),
    ('Fechado', '#10B981', 4, target_company_id)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_saas_metrics()
RETURNS TABLE(
  total_companies bigint,
  total_users bigint,
  total_leads bigint,
  total_appointments bigint,
  active_companies bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.companies)::bigint,
    (SELECT COUNT(*) FROM public.profiles)::bigint,
    (SELECT COUNT(*) FROM public.leads)::bigint,
    (SELECT COUNT(*) FROM public.appointments)::bigint,
    (SELECT COUNT(*) FROM public.companies WHERE status = 'Ativo')::bigint;
END;
$$;