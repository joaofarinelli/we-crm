-- Adicionar coluna company_id à tabela partners
ALTER TABLE public.partners 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Atualizar registros existentes (opcional - pode ser necessário ajustar manualmente)
-- UPDATE public.partners SET company_id = (SELECT id FROM public.companies LIMIT 1) WHERE company_id IS NULL;

-- Remover políticas RLS existentes
DROP POLICY IF EXISTS "Users can create partners" ON public.partners;
DROP POLICY IF EXISTS "Users can delete partners" ON public.partners;
DROP POLICY IF EXISTS "Users can update partners" ON public.partners;
DROP POLICY IF EXISTS "Users can view all partners" ON public.partners;

-- Criar novas políticas RLS que filtram por empresa
CREATE POLICY "Users can create partners for their company" 
ON public.partners 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can view their company partners" 
ON public.partners 
FOR SELECT 
USING (company_id IN (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can update their company partners" 
ON public.partners 
FOR UPDATE 
USING (company_id IN (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their company partners" 
ON public.partners 
FOR DELETE 
USING (company_id IN (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));