-- Criar role Admin específico para a empresa do usuário
INSERT INTO public.roles (name, description, is_system_role, company_id, permissions)
VALUES (
  'Admin',
  'Administrador da empresa com acesso completo',
  false,
  '82276376-0282-47c1-ae2d-1951a396554d',
  '{}'::jsonb
)
ON CONFLICT (name, company_id) DO NOTHING;

-- Atualizar o perfil do usuário para usar o role Admin da empresa
-- mantendo as capacidades de SaaS Admin através da função is_current_user_admin()
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.roles 
  WHERE name = 'Admin' 
  AND company_id = '82276376-0282-47c1-ae2d-1951a396554d'
  LIMIT 1
)
WHERE id = auth.uid() 
AND company_id = '82276376-0282-47c1-ae2d-1951a396554d';