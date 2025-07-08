-- Adicionar coluna partner_id na tabela leads
ALTER TABLE public.leads ADD COLUMN partner_id uuid REFERENCES public.partners(id);

-- Criar índice para melhor performance
CREATE INDEX idx_leads_partner_id ON public.leads(partner_id);

-- Atualizar RLS policies para partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policy para visualizar parceiros da empresa
CREATE POLICY "Users can view their company partners" 
ON public.partners 
FOR SELECT 
USING (true);

-- Policy para criar parceiros
CREATE POLICY "Users can create partners" 
ON public.partners 
FOR INSERT 
WITH CHECK (true);

-- Policy para atualizar parceiros
CREATE POLICY "Users can update partners" 
ON public.partners 
FOR UPDATE 
USING (true);

-- Policy para deletar parceiros
CREATE POLICY "Users can delete partners" 
ON public.partners 
FOR DELETE 
USING (true);