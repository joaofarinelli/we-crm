-- Verificar se já existe role Admin para a empresa, se não, criar
DO $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Buscar role Admin existente para a empresa
  SELECT id INTO admin_role_id
  FROM public.roles 
  WHERE name = 'Admin' 
  AND company_id = '82276376-0282-47c1-ae2d-1951a396554d';
  
  -- Se não existe, criar
  IF admin_role_id IS NULL THEN
    INSERT INTO public.roles (name, description, is_system_role, company_id, permissions)
    VALUES (
      'Admin',
      'Administrador da empresa com acesso completo',
      false,
      '82276376-0282-47c1-ae2d-1951a396554d',
      '{}'::jsonb
    )
    RETURNING id INTO admin_role_id;
  END IF;
  
  -- Atualizar o perfil do usuário para usar o role Admin da empresa
  UPDATE public.profiles 
  SET role_id = admin_role_id
  WHERE company_id = '82276376-0282-47c1-ae2d-1951a396554d'
  AND email IN (
    SELECT email FROM auth.users WHERE id IN (
      SELECT id FROM public.profiles WHERE company_id = '82276376-0282-47c1-ae2d-1951a396554d'
    )
  );
END $$;