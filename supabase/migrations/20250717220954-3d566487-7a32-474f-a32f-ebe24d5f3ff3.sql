-- Migração para implementar cargos fixos da plataforma

-- 1. Deletar cargos do sistema existentes (preservando usuários)
DELETE FROM public.roles WHERE is_system_role = true;

-- 2. Inserir os 7 novos cargos fixos como system roles
INSERT INTO public.roles (name, description, is_system_role, company_id, permissions) VALUES
  ('Administrador', 'Administrador com acesso completo ao sistema', true, NULL, '{"leads":{"view":true,"create":true,"edit":true,"delete":true,"assign":true,"export":true,"import":true},"appointments":{"view":true,"create":true,"edit":true,"delete":true,"viewAll":true},"meetings":{"view":true,"create":true,"edit":true,"delete":true,"moderate":true},"tasks":{"view":true,"create":true,"edit":true,"delete":true,"assign":true},"contacts":{"view":true,"create":true,"edit":true,"delete":true},"scripts":{"view":true,"create":true,"edit":true,"delete":true},"reports":{"view":true,"export":true,"advanced":true},"scheduleBlocks":{"view":true,"create":true,"edit":true,"delete":true},"partners":{"view":true,"create":true,"edit":true,"delete":true},"admin":{"manageUsers":true,"manageRoles":true,"companySettings":true,"systemSettings":false}}'::jsonb),
  
  ('SDR', 'Sales Development Representative - Geração de leads', true, NULL, '{"leads":{"view":true,"create":true,"edit":true,"delete":false,"assign":false,"export":true,"import":true},"appointments":{"view":true,"create":true,"edit":true,"delete":false,"viewAll":false},"meetings":{"view":true,"create":true,"edit":true,"delete":false,"moderate":false},"tasks":{"view":true,"create":true,"edit":true,"delete":false,"assign":false},"contacts":{"view":true,"create":true,"edit":true,"delete":false},"scripts":{"view":true,"create":false,"edit":false,"delete":false},"reports":{"view":true,"export":false,"advanced":false},"scheduleBlocks":{"view":true,"create":true,"edit":true,"delete":true},"partners":{"view":true,"create":false,"edit":false,"delete":false},"admin":{"manageUsers":false,"manageRoles":false,"companySettings":false,"systemSettings":false}}'::jsonb),
  
  ('Closer', 'Fechador de vendas - Conversão de leads', true, NULL, '{"leads":{"view":true,"create":false,"edit":true,"delete":false,"assign":false,"export":true,"import":false},"appointments":{"view":true,"create":true,"edit":true,"delete":false,"viewAll":true},"meetings":{"view":true,"create":true,"edit":true,"delete":false,"moderate":false},"tasks":{"view":true,"create":true,"edit":true,"delete":false,"assign":false},"contacts":{"view":true,"create":true,"edit":true,"delete":false},"scripts":{"view":true,"create":true,"edit":true,"delete":false},"reports":{"view":true,"export":true,"advanced":true},"scheduleBlocks":{"view":true,"create":true,"edit":true,"delete":true},"partners":{"view":true,"create":false,"edit":false,"delete":false},"admin":{"manageUsers":false,"manageRoles":false,"companySettings":false,"systemSettings":false}}'::jsonb),
  
  ('Visitante', 'Acesso apenas para visualização', true, NULL, '{"leads":{"view":true,"create":false,"edit":false,"delete":false,"assign":false,"export":false,"import":false},"appointments":{"view":true,"create":false,"edit":false,"delete":false,"viewAll":false},"meetings":{"view":true,"create":false,"edit":false,"delete":false,"moderate":false},"tasks":{"view":true,"create":false,"edit":false,"delete":false,"assign":false},"contacts":{"view":true,"create":false,"edit":false,"delete":false},"scripts":{"view":true,"create":false,"edit":false,"delete":false},"reports":{"view":true,"export":false,"advanced":false},"scheduleBlocks":{"view":false,"create":false,"edit":false,"delete":false},"partners":{"view":true,"create":false,"edit":false,"delete":false},"admin":{"manageUsers":false,"manageRoles":false,"companySettings":false,"systemSettings":false}}'::jsonb),
  
  ('Supervisor', 'Supervisor com permissões de gestão de equipe', true, NULL, '{"leads":{"view":true,"create":true,"edit":true,"delete":true,"assign":true,"export":true,"import":true},"appointments":{"view":true,"create":true,"edit":true,"delete":true,"viewAll":true},"meetings":{"view":true,"create":true,"edit":true,"delete":true,"moderate":true},"tasks":{"view":true,"create":true,"edit":true,"delete":true,"assign":true},"contacts":{"view":true,"create":true,"edit":true,"delete":true},"scripts":{"view":true,"create":true,"edit":true,"delete":true},"reports":{"view":true,"export":true,"advanced":true},"scheduleBlocks":{"view":true,"create":true,"edit":true,"delete":true},"partners":{"view":true,"create":true,"edit":true,"delete":true},"admin":{"manageUsers":true,"manageRoles":false,"companySettings":false,"systemSettings":false}}'::jsonb),
  
  ('Social Seller', 'Especialista em vendas via redes sociais', true, NULL, '{"leads":{"view":true,"create":true,"edit":true,"delete":false,"assign":false,"export":true,"import":true},"appointments":{"view":true,"create":true,"edit":true,"delete":false,"viewAll":false},"meetings":{"view":true,"create":true,"edit":true,"delete":false,"moderate":false},"tasks":{"view":true,"create":true,"edit":true,"delete":false,"assign":false},"contacts":{"view":true,"create":true,"edit":true,"delete":false},"scripts":{"view":true,"create":true,"edit":true,"delete":false},"reports":{"view":true,"export":true,"advanced":false},"scheduleBlocks":{"view":true,"create":true,"edit":true,"delete":true},"partners":{"view":true,"create":true,"edit":true,"delete":false},"admin":{"manageUsers":false,"manageRoles":false,"companySettings":false,"systemSettings":false}}'::jsonb),
  
  ('Vendedor', 'Vendedor padrão com permissões básicas de venda', true, NULL, '{"leads":{"view":true,"create":true,"edit":true,"delete":false,"assign":false,"export":true,"import":false},"appointments":{"view":true,"create":true,"edit":true,"delete":false,"viewAll":false},"meetings":{"view":true,"create":true,"edit":true,"delete":false,"moderate":false},"tasks":{"view":true,"create":true,"edit":true,"delete":false,"assign":false},"contacts":{"view":true,"create":true,"edit":true,"delete":false},"scripts":{"view":true,"create":true,"edit":true,"delete":false},"reports":{"view":true,"export":true,"advanced":false},"scheduleBlocks":{"view":true,"create":true,"edit":true,"delete":true},"partners":{"view":true,"create":false,"edit":false,"delete":false},"admin":{"manageUsers":false,"manageRoles":false,"companySettings":false,"systemSettings":false}}'::jsonb);

-- 3. Atualizar usuários existentes para os novos cargos (mapeamento)
-- Primeiro, buscar os IDs dos novos cargos
WITH new_roles AS (
  SELECT id, name FROM public.roles WHERE is_system_role = true
),
role_mapping AS (
  SELECT 
    p.id as profile_id,
    CASE 
      WHEN r.name IN ('Admin', 'Administrador') THEN (SELECT id FROM new_roles WHERE name = 'Administrador')
      WHEN r.name = 'SDR' THEN (SELECT id FROM new_roles WHERE name = 'SDR')
      WHEN r.name = 'Closer' THEN (SELECT id FROM new_roles WHERE name = 'Closer')
      ELSE (SELECT id FROM new_roles WHERE name = 'SDR') -- Fallback para SDR
    END as new_role_id
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.role_id IS NOT NULL
)
UPDATE public.profiles 
SET role_id = role_mapping.new_role_id
FROM role_mapping 
WHERE profiles.id = role_mapping.profile_id;

-- 4. Atualizar usuários sem cargo para SDR (cargo padrão)
UPDATE public.profiles 
SET role_id = (SELECT id FROM public.roles WHERE name = 'SDR' AND is_system_role = true LIMIT 1)
WHERE role_id IS NULL;

-- 5. Deletar cargos customizados das empresas (opcional - manter comentado se quiser preservar)
-- DELETE FROM public.roles WHERE is_system_role = false;

-- 6. Atualizar função create_default_roles_for_company para não criar mais cargos
CREATE OR REPLACE FUNCTION public.create_default_roles_for_company(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Função agora está vazia - não cria mais cargos padrão
  -- Todos os cargos são system roles fixos
  NULL;
END;
$function$;