
-- Drop the previous functions to recreate them with better logic
DROP FUNCTION IF EXISTS public.create_default_pipeline_columns(uuid);
DROP FUNCTION IF EXISTS public.sync_appointment_status_with_pipeline();

-- Create an improved function that handles existing columns properly
CREATE OR REPLACE FUNCTION public.create_default_pipeline_columns(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_order_index INTEGER;
  default_columns TEXT[] := ARRAY['Agendado', 'Confirmado', 'Realizado', 'Cancelado'];
  default_colors TEXT[] := ARRAY['#3B82F6', '#10B981', '#6B7280', '#EF4444'];
  i INTEGER;
BEGIN
  -- Get the current max order_index for this company
  SELECT COALESCE(MAX(order_index), 0) INTO max_order_index
  FROM public.pipeline_columns 
  WHERE company_id = target_company_id;

  -- Insert default pipeline columns if they don't exist
  FOR i IN 1..array_length(default_columns, 1) LOOP
    INSERT INTO public.pipeline_columns (name, color, order_index, company_id)
    SELECT default_columns[i], default_colors[i], max_order_index + i, target_company_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.pipeline_columns 
      WHERE company_id = target_company_id 
      AND name = default_columns[i]
    );
  END LOOP;
END;
$$;

-- Create a function to sync appointment statuses with pipeline columns
CREATE OR REPLACE FUNCTION public.sync_appointment_status_with_pipeline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_record RECORD;
BEGIN
  -- For each company, ensure they have default pipeline columns
  FOR company_record IN SELECT id FROM public.companies LOOP
    PERFORM public.create_default_pipeline_columns(company_record.id);
  END LOOP;
END;
$$;

-- Run the sync function to create default columns for existing companies
SELECT public.sync_appointment_status_with_pipeline();

-- Update the handle_new_user function to also create default pipeline columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  default_role_id UUID;
  user_company_id UUID;
  user_domain TEXT;
BEGIN
  -- Extrair domínio do email
  user_domain := split_part(NEW.email, '@', 2);
  
  -- Buscar empresa pelo domínio
  SELECT id INTO user_company_id 
  FROM public.companies 
  WHERE domain = user_domain;
  
  -- Se não encontrar empresa, criar uma nova (primeiro usuário da empresa)
  IF user_company_id IS NULL THEN
    INSERT INTO public.companies (name, domain)
    VALUES (user_domain, user_domain)
    RETURNING id INTO user_company_id;
    
    -- Criar cargos padrão para a nova empresa
    PERFORM public.create_default_roles_for_company(user_company_id);
    
    -- Criar colunas padrão do pipeline para a nova empresa
    PERFORM public.create_default_pipeline_columns(user_company_id);
    
    -- Primeiro usuário vira Admin da empresa
    SELECT id INTO default_role_id 
    FROM public.roles 
    WHERE name = 'Admin' AND company_id = user_company_id 
    LIMIT 1;
  ELSE
    -- Usuários subsequentes viram SDR por padrão
    SELECT id INTO default_role_id 
    FROM public.roles 
    WHERE name = 'SDR' AND company_id = user_company_id 
    LIMIT 1;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, role_id, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    default_role_id,
    user_company_id
  );
  
  RETURN NEW;
END;
$function$;
