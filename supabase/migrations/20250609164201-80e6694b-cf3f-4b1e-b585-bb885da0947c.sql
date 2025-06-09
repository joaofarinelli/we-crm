
-- Criar tabela para armazenar as colunas do pipeline
CREATE TABLE public.pipeline_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, order_index)
);

-- Habilitar RLS
ALTER TABLE public.pipeline_columns ENABLE ROW LEVEL SECURITY;

-- Política para visualizar colunas da própria empresa
CREATE POLICY "Users can view their company pipeline columns" 
  ON public.pipeline_columns 
  FOR SELECT 
  USING (company_id = public.get_current_user_company_id());

-- Política para inserir colunas na própria empresa
CREATE POLICY "Users can create their company pipeline columns" 
  ON public.pipeline_columns 
  FOR INSERT 
  WITH CHECK (company_id = public.get_current_user_company_id());

-- Política para atualizar colunas da própria empresa
CREATE POLICY "Users can update their company pipeline columns" 
  ON public.pipeline_columns 
  FOR UPDATE 
  USING (company_id = public.get_current_user_company_id());

-- Política para deletar colunas da própria empresa
CREATE POLICY "Users can delete their company pipeline columns" 
  ON public.pipeline_columns 
  FOR DELETE 
  USING (company_id = public.get_current_user_company_id());

-- Inserir colunas padrão para empresas existentes
INSERT INTO public.pipeline_columns (company_id, name, order_index, color)
SELECT 
  id as company_id,
  'Frio' as name,
  1 as order_index,
  '#3B82F6' as color
FROM public.companies
WHERE id NOT IN (SELECT DISTINCT company_id FROM public.pipeline_columns WHERE name = 'Frio');

INSERT INTO public.pipeline_columns (company_id, name, order_index, color)
SELECT 
  id as company_id,
  'Morno' as name,
  2 as order_index,
  '#F59E0B' as color
FROM public.companies
WHERE id NOT IN (SELECT DISTINCT company_id FROM public.pipeline_columns WHERE name = 'Morno');

INSERT INTO public.pipeline_columns (company_id, name, order_index, color)
SELECT 
  id as company_id,
  'Quente' as name,
  3 as order_index,
  '#EF4444' as color
FROM public.companies
WHERE id NOT IN (SELECT DISTINCT company_id FROM public.pipeline_columns WHERE name = 'Quente');
