-- Migração para centralizar cargos no sistema e eliminar duplicações

-- 1. Primeiro, criar cargos padrão do sistema se não existirem
INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) VALUES
  ('Admin', 'Administrador da empresa com acesso completo', true, null, '{}'::jsonb),
  ('SDR', 'Sales Development Representative - Geração de leads', true, null, '{}'::jsonb),
  ('Closer', 'Fechador de vendas - Conversão de leads', true, null, '{}'::jsonb),
  ('Gerente', 'Gerente com permissões administrativas', true, null, '{}'::jsonb)
ON CONFLICT (name, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid)) DO NOTHING;

-- 2. Criar função para migrar usuários de roles de empresa para roles do sistema
CREATE OR REPLACE FUNCTION migrate_company_roles_to_system()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  system_role_id UUID;
  company_role_name TEXT;
BEGIN
  -- Para cada perfil que tem um role de empresa
  FOR profile_record IN 
    SELECT p.id, p.role_id, r.name as role_name
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE r.is_system_role = false AND r.company_id IS NOT NULL
  LOOP
    -- Buscar o role do sistema equivalente
    SELECT id INTO system_role_id
    FROM public.roles
    WHERE name = profile_record.role_name
    AND is_system_role = true
    AND company_id IS NULL
    LIMIT 1;
    
    -- Se encontrou o role do sistema, atualizar o perfil
    IF system_role_id IS NOT NULL THEN
      UPDATE public.profiles
      SET role_id = system_role_id
      WHERE id = profile_record.id;
    END IF;
  END LOOP;
END;
$$;

-- 3. Executar a migração
SELECT migrate_company_roles_to_system();

-- 4. Remover roles de empresa duplicados que não estão mais sendo usados
DELETE FROM public.roles 
WHERE is_system_role = false 
AND company_id IS NOT NULL
AND id NOT IN (SELECT DISTINCT role_id FROM public.profiles WHERE role_id IS NOT NULL);

-- 5. Atualizar políticas RLS para roles
DROP POLICY IF EXISTS "Users can create roles for their company" ON public.roles;
DROP POLICY IF EXISTS "Users can update roles for their company" ON public.roles;
DROP POLICY IF EXISTS "Users can delete roles for their company" ON public.roles;
DROP POLICY IF EXISTS "Users can view their company roles" ON public.roles;

-- Nova política para visualizar apenas roles do sistema
CREATE POLICY "Users can view system roles" 
ON public.roles 
FOR SELECT 
USING (is_system_role = true);

-- Política para SaaS admins gerenciarem roles do sistema
CREATE POLICY "SaaS admins can manage system roles" 
ON public.roles 
FOR ALL 
USING (is_saas_admin() AND is_system_role = true)
WITH CHECK (is_saas_admin() AND is_system_role = true);

-- 6. Atualizar função create_default_roles_for_company para não criar roles
CREATE OR REPLACE FUNCTION public.create_default_roles_for_company(target_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função agora não cria roles, apenas garante que existam os roles do sistema
  -- Os roles do sistema já foram criados na migração acima
  RETURN;
END;
$$;

-- 7. Atualizar função setup_company_admin para usar role do sistema
CREATE OR REPLACE FUNCTION public.setup_company_admin(user_id UUID, company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Buscar o role de Admin do sistema
  SELECT id INTO admin_role_id 
  FROM public.roles 
  WHERE name = 'Admin' 
    AND is_system_role = true 
    AND company_id IS NULL
  LIMIT 1;
  
  -- Se não encontrou o role do sistema, criar
  IF admin_role_id IS NULL THEN
    INSERT INTO public.roles (name, description, is_system_role, company_id, permissions)
    VALUES ('Admin', 'Administrador da empresa com acesso completo', true, null, '{}'::jsonb)
    RETURNING id INTO admin_role_id;
  END IF;
  
  -- Atualizar o perfil do usuário
  UPDATE public.profiles 
  SET company_id = setup_company_admin.company_id, 
      role_id = admin_role_id
  WHERE id = setup_company_admin.user_id;
END;
$$;

-- 8. Limpar função temporária
DROP FUNCTION IF EXISTS migrate_company_roles_to_system();