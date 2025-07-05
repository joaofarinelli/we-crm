-- Atualizar função setup_company_admin para usar cargos específicos da empresa
CREATE OR REPLACE FUNCTION public.setup_company_admin(user_id UUID, company_id UUID)
RETURNS VOID AS $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Buscar o role de Admin específico da empresa (não os roles do sistema)
  SELECT id INTO admin_role_id 
  FROM public.roles 
  WHERE name = 'Admin' 
    AND company_id = setup_company_admin.company_id 
    AND is_system_role = false 
  LIMIT 1;
  
  -- Se não encontrou o role da empresa, criar os cargos padrão
  IF admin_role_id IS NULL THEN
    PERFORM public.create_default_roles_for_company(setup_company_admin.company_id);
    
    -- Buscar novamente o role de Admin da empresa
    SELECT id INTO admin_role_id 
    FROM public.roles 
    WHERE name = 'Admin' 
      AND company_id = setup_company_admin.company_id 
      AND is_system_role = false 
    LIMIT 1;
  END IF;
  
  -- Atualizar o perfil do usuário
  UPDATE public.profiles 
  SET company_id = setup_company_admin.company_id, 
      role_id = admin_role_id
  WHERE id = setup_company_admin.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;