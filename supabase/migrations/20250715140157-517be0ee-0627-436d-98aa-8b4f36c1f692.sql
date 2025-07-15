-- Separar Super Admin de Roles regulares
-- Adicionar coluna is_super_admin na tabela profiles
ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;

-- Migrar usuários existentes com role "Administrador do Sistema" para is_super_admin = true
UPDATE public.profiles 
SET is_super_admin = true
WHERE role_id IN (
  SELECT id FROM public.roles 
  WHERE name = 'Administrador do Sistema' AND is_system_role = true
);

-- Atualizar função is_saas_admin para usar a nova coluna
CREATE OR REPLACE FUNCTION public.is_saas_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
BEGIN
  RETURN COALESCE((
    SELECT is_super_admin 
    FROM public.profiles 
    WHERE id = auth.uid()
  ), false);
END;
$$;

-- Atualizar função is_saas_admin_for_company_management para usar a nova coluna
CREATE OR REPLACE FUNCTION public.is_saas_admin_for_company_management()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(is_super_admin, false)
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- Atualizar função is_current_user_admin para distinguir entre admin de empresa e super admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  user_role_name text;
  is_super boolean;
BEGIN
  -- Verificar se é super admin primeiro
  SELECT is_super_admin INTO is_super
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF is_super = true THEN
    RETURN true;
  END IF;
  
  -- Verificar se é admin de empresa
  SELECT r.name INTO user_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- Roles de admin de empresa (não incluir mais "Administrador do Sistema")
  RETURN user_role_name IN (
    'Admin', 'Administrador', 'Gerente'
  );
END;
$$;

-- Remover role "Administrador do Sistema" (opcional, comentado por segurança)
-- DELETE FROM public.roles WHERE name = 'Administrador do Sistema' AND is_system_role = true;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON public.profiles(is_super_admin) WHERE is_super_admin = true;