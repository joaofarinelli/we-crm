-- Criar tabela para armazenar tags de leads
CREATE TABLE public.lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, company_id)
);

-- Criar tabela de relacionamento entre leads e tags
CREATE TABLE public.lead_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, tag_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lead_tags
CREATE POLICY "Users can view their company lead tags" 
ON public.lead_tags 
FOR SELECT 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create lead tags for their company" 
ON public.lead_tags 
FOR INSERT 
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company lead tags" 
ON public.lead_tags 
FOR UPDATE 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their company lead tags" 
ON public.lead_tags 
FOR DELETE 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Políticas RLS para lead_tag_assignments
CREATE POLICY "Users can view their company lead tag assignments" 
ON public.lead_tag_assignments 
FOR SELECT 
USING (lead_id IN (SELECT id FROM leads WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can create lead tag assignments for their company" 
ON public.lead_tag_assignments 
FOR INSERT 
WITH CHECK (lead_id IN (SELECT id FROM leads WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can delete their company lead tag assignments" 
ON public.lead_tag_assignments 
FOR DELETE 
USING (lead_id IN (SELECT id FROM leads WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

-- Adicionar foreign keys
ALTER TABLE public.lead_tags 
ADD CONSTRAINT fk_lead_tags_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.lead_tag_assignments 
ADD CONSTRAINT fk_lead_tag_assignments_lead 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.lead_tag_assignments 
ADD CONSTRAINT fk_lead_tag_assignments_tag 
FOREIGN KEY (tag_id) REFERENCES public.lead_tags(id) ON DELETE CASCADE;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lead_tags_updated_at
BEFORE UPDATE ON public.lead_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();