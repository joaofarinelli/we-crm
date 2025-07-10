-- Adicionar campos de produto e receita na tabela leads
ALTER TABLE public.leads 
ADD COLUMN product_name TEXT,
ADD COLUMN product_value DECIMAL(10,2),
ADD COLUMN revenue_generated DECIMAL(10,2) DEFAULT 0,
ADD COLUMN revenue_lost DECIMAL(10,2) DEFAULT 0;

-- Criar tabela de produtos para gerenciamento centralizado
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para products
CREATE POLICY "Users can create products for their company" 
ON public.products FOR INSERT 
WITH CHECK (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can view their company products" 
ON public.products FOR SELECT 
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update their company products" 
ON public.products FOR UPDATE 
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their company products" 
ON public.products FOR DELETE 
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

-- Adicionar foreign key constraint para products
ALTER TABLE public.products 
ADD CONSTRAINT products_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- Trigger para atualizar updated_at em products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular receita automaticamente quando status do lead muda
CREATE OR REPLACE FUNCTION public.calculate_lead_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset revenue fields
  NEW.revenue_generated := 0;
  NEW.revenue_lost := 0;
  
  -- Calculate based on status
  IF NEW.status = 'Vendido' AND NEW.product_value IS NOT NULL THEN
    NEW.revenue_generated := NEW.product_value;
  ELSIF NEW.status = 'Perdido' AND NEW.product_value IS NOT NULL THEN
    NEW.revenue_lost := NEW.product_value;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular receita automaticamente
CREATE TRIGGER calculate_lead_revenue_trigger
  BEFORE INSERT OR UPDATE OF status, product_value ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_lead_revenue();