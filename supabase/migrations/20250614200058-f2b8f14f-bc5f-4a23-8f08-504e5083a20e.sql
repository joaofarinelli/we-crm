
-- Criar tabela para registros de atendimento
CREATE TABLE public.appointment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  objections TEXT,
  next_steps TEXT,
  outcome TEXT CHECK (outcome IN ('Fechou', 'Não Fechou', 'Aguardando', 'Reagendar')),
  notes TEXT,
  created_by UUID NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para follow-ups
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  appointment_record_id UUID REFERENCES public.appointment_records(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL DEFAULT 1,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Telefone', 'WhatsApp', 'Email', 'Presencial', 'VideoCall')),
  message_sent TEXT,
  response_received TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  result TEXT CHECK (result IN ('Fechou', 'Não Fechou', 'Aguardando', 'Sem Resposta', 'Reagendar')),
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS nas tabelas
ALTER TABLE public.appointment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para appointment_records
CREATE POLICY "Users can view appointment records from their company"
  ON public.appointment_records
  FOR SELECT
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create appointment records for their company"
  ON public.appointment_records
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update appointment records from their company"
  ON public.appointment_records
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete appointment records from their company"
  ON public.appointment_records
  FOR DELETE
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas RLS para follow_ups
CREATE POLICY "Users can view follow ups from their company"
  ON public.follow_ups
  FOR SELECT
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create follow ups for their company"
  ON public.follow_ups
  FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update follow ups from their company"
  ON public.follow_ups
  FOR UPDATE
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete follow ups from their company"
  ON public.follow_ups
  FOR DELETE
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Criar índices para performance
CREATE INDEX idx_appointment_records_appointment_id ON public.appointment_records(appointment_id);
CREATE INDEX idx_appointment_records_company_id ON public.appointment_records(company_id);
CREATE INDEX idx_follow_ups_appointment_id ON public.follow_ups(appointment_id);
CREATE INDEX idx_follow_ups_appointment_record_id ON public.follow_ups(appointment_record_id);
CREATE INDEX idx_follow_ups_company_id ON public.follow_ups(company_id);
CREATE INDEX idx_follow_ups_scheduled_date ON public.follow_ups(scheduled_date);
CREATE INDEX idx_follow_ups_completed ON public.follow_ups(completed);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointment_records_updated_at BEFORE UPDATE ON public.appointment_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
