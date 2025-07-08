-- Adicionar coluna partner_id na tabela leads
ALTER TABLE public.leads ADD COLUMN partner_id uuid REFERENCES public.partners(id);

-- Criar índice para melhor performance
CREATE INDEX idx_leads_partner_id ON public.leads(partner_id);