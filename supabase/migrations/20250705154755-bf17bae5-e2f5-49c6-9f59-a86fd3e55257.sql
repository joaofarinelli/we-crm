-- Função para criar cargos padrão para uma empresa específica
CREATE OR REPLACE FUNCTION public.create_default_roles_for_company(target_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) VALUES
    ('Admin', 'Administrador da empresa com acesso completo', false, target_company_id, '{}'::jsonb),
    ('SDR', 'Sales Development Representative - Geração de leads', false, target_company_id, '{}'::jsonb),
    ('Closer', 'Fechador de vendas - Conversão de leads', false, target_company_id, '{}'::jsonb)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Função trigger que será executada após inserir uma nova empresa
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar cargos padrão para a nova empresa
  PERFORM public.create_default_roles_for_company(NEW.id);
  
  -- Criar colunas padrão do pipeline para a empresa
  PERFORM public.create_default_pipeline_columns(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Criar o trigger para executar automaticamente
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();

-- Migrar empresas existentes que não têm cargos
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN 
    SELECT c.id 
    FROM public.companies c
    LEFT JOIN public.roles r ON r.company_id = c.id
    WHERE r.id IS NULL
  LOOP
    PERFORM public.create_default_roles_for_company(company_record.id);
  END LOOP;
END;
$$;