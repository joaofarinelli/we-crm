-- Create appointment_records table
CREATE TABLE public.appointment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  objections TEXT,
  next_steps TEXT,
  outcome TEXT CHECK (outcome IN ('Fechou', 'Não Fechou', 'Aguardando', 'Reagendar')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follow_ups table (referenced in AppointmentRecord types)
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  appointment_record_id UUID REFERENCES public.appointment_records(id) ON DELETE SET NULL,
  sequence_number INTEGER NOT NULL DEFAULT 1,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Telefone', 'WhatsApp', 'Email', 'Presencial', 'VideoCall')),
  message_sent TEXT,
  response_received TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  result TEXT CHECK (result IN ('Fechou', 'Não Fechou', 'Aguardando', 'Sem Resposta', 'Reagendar')),
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their company appointment records" ON public.appointment_records FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create appointment records for their company" ON public.appointment_records FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company appointment records" ON public.appointment_records FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company appointment records" ON public.appointment_records FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their company follow ups" ON public.follow_ups FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create follow ups for their company" ON public.follow_ups FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their company follow ups" ON public.follow_ups FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their company follow ups" ON public.follow_ups FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Create admin_companies_view
CREATE VIEW public.admin_companies_view AS
SELECT 
  c.*,
  COALESCE(user_counts.user_count, 0) as user_count,
  COALESCE(lead_counts.leads_count, 0) as leads_count,
  COALESCE(appointment_counts.appointments_count, 0) as appointments_count
FROM public.companies c
LEFT JOIN (
  SELECT company_id, COUNT(*) as user_count
  FROM public.profiles
  GROUP BY company_id
) user_counts ON c.id = user_counts.company_id
LEFT JOIN (
  SELECT company_id, COUNT(*) as leads_count
  FROM public.leads
  GROUP BY company_id
) lead_counts ON c.id = lead_counts.company_id
LEFT JOIN (
  SELECT company_id, COUNT(*) as appointments_count
  FROM public.appointments
  GROUP BY company_id
) appointment_counts ON c.id = appointment_counts.company_id;

-- Create is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_role_name text;
BEGIN
  -- Get the current user's role name
  SELECT r.name INTO user_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- Check if the role is 'Admin' or 'Super Admin' or similar admin roles
  RETURN user_role_name IN ('Admin', 'Super Admin', 'SaaS Admin', 'System Admin');
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_appointment_records_updated_at BEFORE UPDATE ON public.appointment_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions for the view (RLS policies will still apply to underlying tables)
GRANT SELECT ON public.admin_companies_view TO authenticated;